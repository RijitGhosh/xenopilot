"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const firstNames = [
    'Amit', 'Priyanka', 'Rahul', 'Neha', 'Sanjay', 'Anjali', 'Vikram', 'Pooja', 'Arjun', 'Deepika',
    'Rohan', 'Sneha', 'Karan', 'Kriti', 'Aditya', 'Riya', 'Vijay', 'Shalini', 'Manish', 'Komal',
    'Rajesh', 'Divya', 'Suresh', 'Swati', 'Alok', 'Tanvi', 'Harish', 'Preeti', 'Abhishek', 'Nisha',
    'Gaurav', 'Nidhi', 'Sunil', 'Jyoti', 'Anil', 'Megha', 'Vivek', 'Richa', 'Sandip', 'Payal'
];
const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Mehta', 'Singh', 'Joshi', 'Patel', 'Reddy', 'Nair', 'Iyer',
    'Kumar', 'Das', 'Sen', 'Roy', 'Choudhury', 'Mishra', 'Pandey', 'Trivedi', 'Shah', 'Rao',
    'Bose', 'Chatterjee', 'Mukherjee', 'Banerjee', 'Saxena', 'Kapoor', 'Malhotra', 'Khanna', 'Gill', 'Bahl'
];
const goals = [
    'Re-engage dormant customers',
    'Reward loyal VIP customers',
    'Recover inactive cart shoppers',
    'Promote new summer collection launch',
    'Boost sales during weekend flash sale',
    'Appreciation offer for long-time buyers'
];
const channels = ['WHATSAPP', 'EMAIL', 'SMS', 'RCS'];
function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}
function randomIntRange(min, max) {
    return Math.floor(randomRange(min, max));
}
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
async function main() {
    console.log('Clearing database...');
    await prisma.event.deleteMany();
    await prisma.communication.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    console.log('Seeding customers...');
    const customers = [];
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    for (let i = 0; i < 100; i++) {
        const firstName = randomElement(firstNames);
        const lastName = randomElement(lastNames);
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i + 100}@example.com`;
        const phone = `+91${randomIntRange(7000000000, 9999999999)}`;
        let segment = 'Active';
        if (i < 15)
            segment = 'VIP';
        else if (i < 50)
            segment = 'Dormant';
        const customer = await prisma.customer.create({
            data: {
                name,
                email,
                phone,
                segment,
                createdAt: randomDate(oneYearAgo, ninetyDaysAgo),
            }
        });
        customers.push(customer);
    }
    console.log('Seeding orders...');
    let totalOrderCount = 0;
    for (const customer of customers) {
        let ordersToCreate = 0;
        let spendMultiplierMin = 300;
        let spendMultiplierMax = 1500;
        let orderStartRange = oneYearAgo;
        let orderEndRange = now;
        if (customer.segment === 'VIP') {
            ordersToCreate = randomIntRange(8, 20);
            spendMultiplierMin = 1200;
            spendMultiplierMax = 5000;
        }
        else if (customer.segment === 'Dormant') {
            ordersToCreate = randomIntRange(1, 4);
            orderEndRange = ninetyDaysAgo;
        }
        else {
            ordersToCreate = randomIntRange(2, 7);
            orderStartRange = ninetyDaysAgo;
        }
        let customerTotalSpend = 0;
        let customerLastOrderDate = null;
        for (let o = 0; o < ordersToCreate; o++) {
            if (totalOrderCount >= 500 && customer.segment !== 'VIP') {
                continue;
            }
            const amount = Math.round(randomRange(spendMultiplierMin, spendMultiplierMax));
            const orderDate = randomDate(orderStartRange, orderEndRange);
            await prisma.order.create({
                data: {
                    customerId: customer.id,
                    amount,
                    orderDate,
                    status: Math.random() > 0.05 ? 'DELIVERED' : 'RETURNED'
                }
            });
            customerTotalSpend += amount;
            if (!customerLastOrderDate || orderDate > customerLastOrderDate) {
                customerLastOrderDate = orderDate;
            }
            totalOrderCount++;
        }
        await prisma.customer.update({
            where: { id: customer.id },
            data: {
                totalSpend: customerTotalSpend,
                ordersCount: ordersToCreate,
                lastOrderDate: customerLastOrderDate
            }
        });
    }
    console.log(`Seeded ${totalOrderCount} orders.`);
    console.log('Seeding campaigns...');
    const campaignNames = [
        'Dormant Re-Engagement Q1',
        'VIP Platinum Exclusive Loyalty Club',
        'Cart Recovery SMS Campaign',
        'WhatsApp Summer Fashion Drop',
        'Weekend Flash Sale Blast',
        'Holiday Greeting & Coupon',
        'RCS Rich Product Catalog Intro',
        'Dormant Reactivation Blast May',
        'VIP Early Access Private Sale',
        'Abandoned Checkout Push',
        'Mid-Season Clearance Special',
        'WhatsApp Festive Greetings Offer',
        'Monsoon Collection Launch Promo',
        'VIP Anniversary Milestone Reward',
        'Re-engage Inactive 60D Customers',
        'End of Season Clearance Sale',
        'SMS Flash 15% Discount App',
        'New Category Rollout Announcement',
        'Weekend Brunch Delight Discount',
        'VIP Secret Store Sneak Peek'
    ];
    const spawnedCampaigns = [];
    for (let c = 0; c < 20; c++) {
        const goal = randomElement(goals);
        const channel = randomElement(channels);
        const name = campaignNames[c];
        let segmentDefinition = JSON.stringify({ segment: 'Active' });
        if (name.includes('VIP')) {
            segmentDefinition = JSON.stringify({ segment: 'VIP' });
        }
        else if (name.includes('Dormant') || name.includes('Re-engage')) {
            segmentDefinition = JSON.stringify({ segment: 'Dormant' });
        }
        const campaign = await prisma.campaign.create({
            data: {
                name,
                goal,
                segmentDefinition,
                channel,
                subject: channel === 'EMAIL' ? `Special Gift Inside! ${goal}` : null,
                message: `Hello {{name}}, we have a special offer for you. Get 15% off using code WELCOME15. Visit xeno.link/app`,
                cta: 'Claim Discount',
                status: c < 4 ? 'LAUNCHED' : 'COMPLETED',
                expectedRevenue: randomIntRange(5000, 30000),
                createdAt: randomDate(oneYearAgo, now),
            }
        });
        spawnedCampaigns.push(campaign);
    }
    console.log('Seeding communications and events...');
    for (const campaign of spawnedCampaigns) {
        const targetSegment = campaign.name.includes('VIP') ? 'VIP' : campaign.name.includes('Dormant') ? 'Dormant' : 'Active';
        const matchingCustomers = customers.filter(cust => cust.segment === targetSegment).slice(0, 25);
        for (const customer of matchingCustomers) {
            const rand = Math.random();
            let status = 'SENT';
            if (rand > 0.05)
                status = 'DELIVERED';
            if (rand > 0.25)
                status = 'OPENED';
            if (rand > 0.55)
                status = 'CLICKED';
            if (rand > 0.75)
                status = 'CONVERTED';
            if (rand < 0.03)
                status = 'FAILED';
            const communication = await prisma.communication.create({
                data: {
                    campaignId: campaign.id,
                    customerId: customer.id,
                    status,
                    sentAt: randomDate(campaign.createdAt, now)
                }
            });
            const events = ['SENT'];
            if (status !== 'FAILED') {
                if (status === 'DELIVERED' || status === 'OPENED' || status === 'CLICKED' || status === 'CONVERTED') {
                    events.push('DELIVERED');
                }
                if (status === 'OPENED' || status === 'CLICKED' || status === 'CONVERTED') {
                    events.push('OPENED');
                }
                if (status === 'CLICKED' || status === 'CONVERTED') {
                    events.push('CLICKED');
                }
                if (status === 'CONVERTED') {
                    events.push('CONVERTED');
                }
            }
            else {
                events.push('FAILED');
            }
            let eventTime = new Date(communication.sentAt);
            for (const eventType of events) {
                eventTime = new Date(eventTime.getTime() + randomIntRange(1000, 300000));
                let metadata = null;
                if (eventType === 'CONVERTED') {
                    metadata = JSON.stringify({ revenue: Math.round(randomRange(500, 3000)) });
                }
                await prisma.event.create({
                    data: {
                        communicationId: communication.id,
                        type: eventType,
                        timestamp: eventTime,
                        metadata
                    }
                });
            }
        }
    }
    console.log('Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
