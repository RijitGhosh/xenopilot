"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const ai_service_js_1 = require("../services/ai.service.js");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET /api/customers - List customers with search, segment filters, and sorting
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const segment = req.query.segment || '';
        const sortBy = req.query.sortBy || 'name'; // name, totalSpend, lastOrderDate, ordersCount
        const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
        const skip = (page - 1) * limit;
        // Build filter query
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
            ];
        }
        if (segment) {
            where.segment = segment;
        }
        // Query customers
        const customers = await prisma.customer.findMany({
            where,
            orderBy: {
                [sortBy]: sortOrder,
            },
            skip,
            take: limit,
        });
        const total = await prisma.customer.count({ where });
        res.json({
            customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET /api/customers/:id - Retrieve specific customer profile details, history, and AI Summary
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                orders: {
                    orderBy: { orderDate: 'desc' },
                },
                communications: {
                    include: {
                        campaign: true,
                    },
                    orderBy: { sentAt: 'desc' },
                },
            },
        });
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        // Generate AI Summary for this customer
        const aiSummary = await ai_service_js_1.AIService.generateCustomerSummary({
            name: customer.name,
            totalSpend: customer.totalSpend,
            ordersCount: customer.ordersCount,
            segment: customer.segment,
            lastOrderDate: customer.lastOrderDate,
        }, customer.orders, customer.communications);
        res.json({
            ...customer,
            aiSummary,
        });
    }
    catch (error) {
        console.error('Error fetching customer details:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
