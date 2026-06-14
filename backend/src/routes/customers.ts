import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AIService } from '../services/ai.service.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/customers - List customers with search, segment filters, and sorting
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const segment = (req.query.segment as string) || '';
    const sortBy = (req.query.sortBy as string) || 'name'; // name, totalSpend, lastOrderDate, ordersCount
    const sortOrder = (req.query.sortOrder as string) === 'desc' ? 'desc' : 'asc';

    const skip = (page - 1) * limit;

    // Build filter query
    const where: any = {};

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
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/customers - Create a new customer
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, totalSpend, ordersCount, segment } = req.body;

    // Validation
    if (!name || !email || !phone) {
      res.status(400).json({ error: 'Name, email, and phone are required' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        totalSpend: parseFloat(totalSpend) || 0,
        ordersCount: parseInt(ordersCount) || 0,
        segment: segment || 'Active',
      },
    });

    res.status(201).json(customer);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/customers/:id - Retrieve specific customer profile details, history, and AI Summary
router.get('/:id', async (req: Request, res: Response) => {
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
    const aiSummary = await AIService.generateCustomerSummary(
      {
        name: customer.name,
        totalSpend: customer.totalSpend,
        ordersCount: customer.ordersCount,
        segment: customer.segment,
        lastOrderDate: customer.lastOrderDate,
      },
      customer.orders,
      customer.communications
    );

    res.json({
      ...customer,
      aiSummary,
    });
  } catch (error: any) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
