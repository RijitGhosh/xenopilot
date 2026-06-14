import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AIService } from '../services/ai.service.js';

const router = Router();
const prisma = new PrismaClient();

// POST /api/ai/generate-campaign
router.post('/generate-campaign', async (req: Request, res: Response) => {
  try {
    const { goal } = req.body;

    if (!goal || typeof goal !== 'string') {
      res.status(400).json({ error: 'Missing marketing goal prompt' });
      return;
    }

    // Fetch baseline total customers count for segment preview
    const customerCount = await prisma.customer.count();

    // Call AI campaign generation
    const campaignProposal = await AIService.generateCampaign(goal, customerCount);

    res.json(campaignProposal);

  } catch (error: any) {
    console.error('Error generating AI campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
