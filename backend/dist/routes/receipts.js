"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// POST /api/receipts - Webhook endpoint for channel-service message tracking
router.post('/', async (req, res) => {
    try {
        const { communicationId, type, timestamp, metadata } = req.body;
        if (!communicationId || !type) {
            res.status(400).json({ error: 'Missing required callback fields: communicationId, type' });
            return;
        }
        console.log(`[Receipt Webhook] Comm ID: ${communicationId} -> State: ${type}`);
        // 1. Fetch communication
        const communication = await prisma.communication.findUnique({
            where: { id: communicationId },
            include: { customer: true }
        });
        if (!communication) {
            res.status(404).json({ error: 'Communication record not found' });
            return;
        }
        // 2. Create Event log
        const metaString = metadata ? JSON.stringify(metadata) : null;
        await prisma.event.create({
            data: {
                communicationId,
                type: type.toUpperCase(),
                timestamp: timestamp ? new Date(timestamp) : new Date(),
                metadata: metaString
            }
        });
        // 3. Update communication status
        await prisma.communication.update({
            where: { id: communicationId },
            data: {
                status: type.toUpperCase(),
                updatedAt: new Date()
            }
        });
        // 4. Attribution Logic - Handle conversions
        if (type.toUpperCase() === 'CONVERTED' && metadata) {
            const revenue = parseFloat(metadata.revenue) || 0;
            if (revenue > 0) {
                console.log(`[Webhook Attribution] Customer ${communication.customer.name} converted! Revenue: ₹${revenue}`);
                // Create transaction order
                await prisma.order.create({
                    data: {
                        customerId: communication.customerId,
                        amount: revenue,
                        orderDate: timestamp ? new Date(timestamp) : new Date(),
                        status: 'DELIVERED'
                    }
                });
                // Fetch current customer orders count and spend
                const customer = communication.customer;
                const newTotalSpend = customer.totalSpend + revenue;
                const newOrdersCount = customer.ordersCount + 1;
                // Update customer aggregates
                await prisma.customer.update({
                    where: { id: communication.customerId },
                    data: {
                        totalSpend: newTotalSpend,
                        ordersCount: newOrdersCount,
                        lastOrderDate: timestamp ? new Date(timestamp) : new Date()
                    }
                });
            }
        }
        res.json({ success: true, message: 'Receipt processed successfully' });
    }
    catch (error) {
        console.error('Error processing receipt callback:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
