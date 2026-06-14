"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const ai_service_js_1 = require("../services/ai.service.js");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// POST /api/ai/generate-campaign
router.post('/generate-campaign', async (req, res) => {
    try {
        const { goal } = req.body;
        if (!goal || typeof goal !== 'string') {
            res.status(400).json({ error: 'Missing marketing goal prompt' });
            return;
        }
        // Fetch baseline total customers count for segment preview
        const customerCount = await prisma.customer.count();
        // Call AI campaign generation
        const campaignProposal = await ai_service_js_1.AIService.generateCampaign(goal, customerCount);
        res.json(campaignProposal);
    }
    catch (error) {
        console.error('Error generating AI campaign:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
