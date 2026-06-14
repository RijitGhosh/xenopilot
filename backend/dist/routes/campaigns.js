"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:5001';
// GET /api/campaigns - List campaigns with delivery performance aggregates
router.get('/', async (req, res) => {
    try {
        const campaigns = await prisma.campaign.findMany({
            include: {
                _count: {
                    select: { communications: true }
                },
                communications: {
                    select: { status: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        // Compute aggregated rates for each campaign
        const enrichedCampaigns = campaigns.map(campaign => {
            const stats = {
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                converted: 0,
                failed: 0
            };
            campaign.communications.forEach(comm => {
                const status = comm.status.toLowerCase();
                if (status === 'sent')
                    stats.sent++;
                else if (status === 'delivered')
                    stats.delivered++;
                else if (status === 'opened')
                    stats.opened++;
                else if (status === 'clicked')
                    stats.clicked++;
                else if (status === 'converted')
                    stats.converted++;
                else if (status === 'failed')
                    stats.failed++;
            });
            // Sum totals up
            const totalDispatched = campaign.communications.length;
            const totalDelivered = stats.delivered + stats.opened + stats.clicked + stats.converted;
            const totalOpened = stats.opened + stats.clicked + stats.converted;
            const totalClicked = stats.clicked + stats.converted;
            const totalConverted = stats.converted;
            const conversionRate = totalDispatched > 0 ? (totalConverted / totalDispatched) * 100 : 0;
            // Extract basic communication count
            const { communications, ...campaignData } = campaign;
            return {
                ...campaignData,
                metrics: {
                    sent: totalDispatched,
                    delivered: totalDelivered,
                    opened: totalOpened,
                    clicked: totalClicked,
                    converted: totalConverted,
                    failed: stats.failed,
                    conversionRate: Math.round(conversionRate * 100) / 100
                }
            };
        });
        res.json(enrichedCampaigns);
    }
    catch (error) {
        console.error('Error listing campaigns:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET /api/campaigns/:id - Detailed campaign view including funnel metrics and logs
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                communications: {
                    include: {
                        customer: true,
                        events: { orderBy: { timestamp: 'asc' } }
                    },
                    orderBy: { sentAt: 'desc' }
                }
            }
        });
        if (!campaign) {
            res.status(404).json({ error: 'Campaign not found' });
            return;
        }
        // Calculate detailed stats
        const stats = {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            converted: 0,
            failed: 0,
            revenueGenerated: 0
        };
        campaign.communications.forEach(comm => {
            const status = comm.status.toUpperCase();
            if (status === 'SENT')
                stats.sent++;
            else if (status === 'DELIVERED')
                stats.delivered++;
            else if (status === 'OPENED')
                stats.opened++;
            else if (status === 'CLICKED')
                stats.clicked++;
            else if (status === 'CONVERTED')
                stats.converted++;
            else if (status === 'FAILED')
                stats.failed++;
            // Sum conversion revenues
            comm.events.forEach(evt => {
                if (evt.type === 'CONVERTED' && evt.metadata) {
                    try {
                        const meta = JSON.parse(evt.metadata);
                        if (meta.revenue) {
                            stats.revenueGenerated += meta.revenue;
                        }
                    }
                    catch (e) {
                        // Ignore parse errors
                    }
                }
            });
        });
        const totalSent = campaign.communications.length;
        const totalDelivered = stats.delivered + stats.opened + stats.clicked + stats.converted;
        const totalOpened = stats.opened + stats.clicked + stats.converted;
        const totalClicked = stats.clicked + stats.converted;
        const totalConverted = stats.converted;
        const metrics = {
            sent: totalSent,
            delivered: totalDelivered,
            opened: totalOpened,
            clicked: totalClicked,
            converted: totalConverted,
            failed: stats.failed,
            revenue: stats.revenueGenerated,
            openRate: totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 10000) / 100 : 0,
            clickRate: totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 10000) / 100 : 0,
            conversionRate: totalSent > 0 ? Math.round((totalConverted / totalSent) * 10000) / 100 : 0,
        };
        res.json({
            campaign,
            metrics
        });
    }
    catch (error) {
        console.error('Error fetching campaign details:', error);
        res.status(500).json({ error: error.message });
    }
});
// POST /api/campaigns/launch - Launch a campaign and stream to Simulator
router.post('/launch', async (req, res) => {
    try {
        const { name, goal, segmentDefinition, channel, subject, message, cta, expectedRevenue } = req.body;
        if (!name || !goal || !segmentDefinition || !channel || !message) {
            res.status(400).json({ error: 'Missing required parameters' });
            return;
        }
        // 1. Parse Segment Definition filter
        let parsedFilters = {};
        try {
            parsedFilters = typeof segmentDefinition === 'string' ? JSON.parse(segmentDefinition) : segmentDefinition;
        }
        catch (e) {
            parsedFilters = { segment: 'Active' };
        }
        // 2. Fetch target customers
        const where = {};
        if (parsedFilters.segment) {
            where.segment = parsedFilters.segment;
        }
        const customers = await prisma.customer.findMany({ where });
        if (customers.length === 0) {
            res.status(400).json({ error: 'Target segment has 0 matching customers. Cannot launch campaign.' });
            return;
        }
        // 3. Create Campaign record in DRAFT
        const campaign = await prisma.campaign.create({
            data: {
                name,
                goal,
                segmentDefinition: JSON.stringify(parsedFilters),
                channel: channel.toUpperCase(),
                subject,
                message,
                cta,
                expectedRevenue: parseFloat(expectedRevenue) || 0,
                status: 'LAUNCHED'
            }
        });
        console.log(`[Campaign Launcher] Created campaign: ${campaign.name} (${campaign.id}) matching ${customers.length} users.`);
        // 4. Asynchronously loop and send communications (non-blocking CRM workflow)
        const dispatches = customers.map(async (customer) => {
            // Create communication entry
            const comm = await prisma.communication.create({
                data: {
                    campaignId: campaign.id,
                    customerId: customer.id,
                    status: 'SENT'
                }
            });
            // Insert baseline SENT event
            await prisma.event.create({
                data: {
                    communicationId: comm.id,
                    type: 'SENT'
                }
            });
            // Prepare payload to channel service
            const payload = {
                recipient: channel.toUpperCase() === 'EMAIL' ? customer.email : customer.phone,
                message: message.replace('{{name}}', customer.name),
                channel: channel.toUpperCase(),
                communicationId: comm.id,
                crmCallbackUrl: `http://localhost:5000/api/receipts`
            };
            // Call simulator api
            try {
                fetch(`${CHANNEL_SERVICE_URL}/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).catch(err => {
                    console.error(`[Launcher] Call to channel-service failed for comm ${comm.id}:`, err.message);
                });
            }
            catch (err) {
                console.error(`[Launcher] Exception calling channel service:`, err.message);
            }
            return comm;
        });
        await Promise.all(dispatches);
        res.status(201).json({
            success: true,
            message: `Campaign launched successfully to ${customers.length} recipients`,
            campaignId: campaign.id,
            recipientCount: customers.length
        });
    }
    catch (error) {
        console.error('Error launching campaign:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
