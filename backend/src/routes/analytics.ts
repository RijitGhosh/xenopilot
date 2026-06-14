import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AIService } from '../services/ai.service.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/analytics - Aggregations for charts and metrics dashboards
router.get('/', async (req: Request, res: Response) => {
  try {
    // 1. High-level metric cards
    const totalCustomers = await prisma.customer.count();
    
    const activeCampaigns = await prisma.campaign.count({
      where: { status: 'LAUNCHED' }
    });

    const revenueResult = await prisma.order.aggregate({
      _sum: { amount: true },
      where: { status: 'DELIVERED' }
    });
    const totalRevenue = revenueResult._sum.amount || 0;

    // Aggregate all communications to find overall conversion rate
    const totalComms = await prisma.communication.count();
    const convertedComms = await prisma.communication.count({
      where: { status: 'CONVERTED' }
    });
    const overallConversionRate = totalComms > 0 ? (convertedComms / totalComms) * 100 : 0;

    // 2. Channel Performance aggregation
    const channels = ['WHATSAPP', 'EMAIL', 'SMS', 'RCS'];
    const channelPerformance = await Promise.all(
      channels.map(async (channel) => {
        // Find campaigns in this channel
        const campaigns = await prisma.campaign.findMany({
          where: { channel },
          include: {
            communications: {
              select: {
                status: true,
                events: {
                  where: { type: 'CONVERTED' },
                  select: { metadata: true }
                }
              }
            }
          }
        });

        let sentCount = 0;
        let convertedCount = 0;
        let revenue = 0;

        campaigns.forEach((camp) => {
          sentCount += camp.communications.length;
          camp.communications.forEach((comm) => {
            if (comm.status === 'CONVERTED') {
              convertedCount++;
            }
            comm.events.forEach((evt) => {
              if (evt.metadata) {
                try {
                  const parsed = JSON.parse(evt.metadata);
                  if (parsed.revenue) revenue += parsed.revenue;
                } catch (e) {}
              }
            });
          });
        });

        const convRate = sentCount > 0 ? (convertedCount / sentCount) * 100 : 0;

        return {
          channel,
          sent: sentCount,
          converted: convertedCount,
          revenue,
          conversionRate: Math.round(convRate * 100) / 100
        };
      })
    );

    // 3. Campaign Performance (Top 5 campaigns by conversion rate)
    const campaignsForChart = await prisma.campaign.findMany({
      take: 6,
      include: {
        communications: {
          select: { status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const campaignPerformance = campaignsForChart.map((camp) => {
      let sent = camp.communications.length;
      let converted = camp.communications.filter(c => c.status === 'CONVERTED').length;
      let conversionRate = sent > 0 ? (converted / sent) * 100 : 0;

      return {
        name: camp.name,
        channel: camp.channel,
        sent,
        converted,
        conversionRate: Math.round(conversionRate * 10) / 10
      };
    });

    // 4. Revenue Trend (Last 6 months)
    // We will simulate monthly trends by grouping order history
    const orders = await prisma.order.findMany({
      where: { status: 'DELIVERED' },
      select: { amount: true, orderDate: true },
      orderBy: { orderDate: 'asc' }
    });

    const monthlyRevenueMap: { [key: string]: number } = {};
    orders.forEach((order) => {
      const date = new Date(order.orderDate);
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyRevenueMap[monthYear] = (monthlyRevenueMap[monthYear] || 0) + order.amount;
    });

    const revenueTrend = Object.keys(monthlyRevenueMap).map((month) => ({
      month,
      revenue: Math.round(monthlyRevenueMap[month])
    })).slice(-6); // last 6 months

    // 5. Generate AI Growth Insights
    const aiInsights = await AIService.generateAnalyticsInsights(
      totalComms,
      totalComms * 0.9, // assume 90% delivery
      totalComms * 0.5, // assume 50% open
      totalComms * 0.2, // assume 20% clicks
      convertedComms,
      totalRevenue
    );

    res.json({
      metrics: {
        totalCustomers,
        activeCampaigns,
        totalRevenue: Math.round(totalRevenue),
        conversionRate: Math.round(overallConversionRate * 100) / 100
      },
      channelPerformance,
      campaignPerformance,
      revenueTrend,
      aiInsights
    });

  } catch (error: any) {
    console.error('Error generating analytics dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
