"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_1 = require("openai");
// Initialize OpenAI client if key is available
const apiKey = process.env.OPENAI_API_KEY || '';
const openai = apiKey ? new openai_1.OpenAI({ apiKey }) : null;
class AIService {
    // Generate campaign from marketer goal
    static async generateCampaign(goal, customerCount = 100) {
        console.log(`[AI Service] Generating campaign for goal: "${goal}"`);
        if (openai) {
            try {
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: `You are XenoPilot, an AI Marketing Agent for consumer brands. Given a marketing goal, your job is to:
1. Define the target audience segment (name, criteria, reasoning).
2. Recommend the best channel (WHATSAPP, EMAIL, SMS, or RCS) with reasoning.
3. Write campaign copy (Message body, CTA, and Subject line if Email).
4. Estimate expected revenue and results.
5. Provide segment filters as a JSON object that can be simulated.

You must return a JSON object strictly matching this schema:
{
  "audienceName": "String description of segment",
  "audienceReasoning": "Why this segment matches the goal",
  "channelRecommendation": "WHATSAPP" | "EMAIL" | "SMS" | "RCS",
  "channelReasoning": "Why this channel is optimal for this segment",
  "subject": "Optional subject line (only if EMAIL)",
  "message": "Campaign message. Use {{name}} for personalization.",
  "cta": "Call to action text (e.g. Shop Now, Claim Discount)",
  "expectedRevenue": 15000,
  "reasoning": "Overall strategy explanation",
  "segmentFilters": {
    "segment": "VIP" | "Dormant" | "Active"
  }
}`
                        },
                        {
                            role: 'user',
                            content: `Goal: "${goal}"`
                        }
                    ],
                    response_format: { type: "json_object" }
                });
                const content = response.choices[0]?.message?.content;
                if (content) {
                    const parsed = JSON.parse(content);
                    // Ensure correct field naming and types
                    return {
                        audienceName: parsed.audienceName || 'Custom Segment',
                        audienceCount: Math.round(customerCount * (parsed.segmentFilters?.segment === 'VIP' ? 0.15 : parsed.segmentFilters?.segment === 'Dormant' ? 0.35 : 0.5)),
                        audienceReasoning: parsed.audienceReasoning || 'Selected based on goals.',
                        channelRecommendation: parsed.channelRecommendation || 'WHATSAPP',
                        channelReasoning: parsed.channelReasoning || 'Recommended channel.',
                        subject: parsed.subject,
                        message: parsed.message || 'Check out our new arrivals!',
                        cta: parsed.cta || 'Shop Now',
                        expectedRevenue: parsed.expectedRevenue || 12000,
                        reasoning: parsed.reasoning || 'AI-generated marketing approach.',
                        segmentFilters: parsed.segmentFilters || { segment: 'Active' }
                    };
                }
            }
            catch (err) {
                console.warn('[AI Service] OpenAI API error, falling back to local generation:', err.message);
            }
        }
        // High-fidelity Local Rule-Based Mock Generator
        const lowerGoal = goal.toLowerCase();
        if (lowerGoal.includes('dormant') || lowerGoal.includes('inactive') || lowerGoal.includes('90 days') || lowerGoal.includes('back')) {
            return {
                audienceName: 'Dormant Customers (No purchase in 90+ days)',
                audienceCount: 35, // matches seeded dormant customers count
                audienceReasoning: 'Customers whose last order date is greater than 90 days ago. Reactivating this pool recovers lost lifetime value.',
                channelRecommendation: 'WHATSAPP',
                channelReasoning: 'WhatsApp achieves a 98% open rate and 30%+ response rate for dormant consumer segments, far outperforming email.',
                message: 'Hey {{name}}, we miss you! It\'s been a while since your last visit. We\'ve added some exciting new collections. Use code COMEBACK20 for 20% off your next purchase.',
                cta: 'Shop 20% Off',
                expectedRevenue: 18500,
                reasoning: 'Re-engaging inactive shoppers through a direct conversational channel (WhatsApp) with a strong discount coupon code (20%) is the industry standard for churn prevention.',
                segmentFilters: { segment: 'Dormant' }
            };
        }
        if (lowerGoal.includes('vip') || lowerGoal.includes('loyal') || lowerGoal.includes('reward') || lowerGoal.includes('spent')) {
            return {
                audienceName: 'VIP High-Spend Club (Top 15% customers)',
                audienceCount: 15, // matches seeded VIP customers count
                audienceReasoning: 'Customers with total spend over ₹10,000 who buy frequently. Retaining VIPs guarantees core revenue streams.',
                channelRecommendation: 'EMAIL',
                channelReasoning: 'VIP customers appreciate premium, media-rich newsletters and formal invitations. Email offers the best real estate for premium branding.',
                subject: 'Exquisite Selection: Early Access for VIP Platinum Members',
                message: 'Dear {{name}}, as one of our most valued patrons, you have been granted early access to our private designer collection sale. Use code VIPONLY for an exclusive 15% off.',
                cta: 'Unlock Early Access',
                expectedRevenue: 38000,
                reasoning: 'VIPs respond strongly to exclusivity and appreciation rather than deep discounting. Rich email templates with early access codes build brand affinity.',
                segmentFilters: { segment: 'VIP' }
            };
        }
        // Default Fallback
        return {
            audienceName: 'Active Shoppers (Recent buyers & high engagement)',
            audienceCount: 50, // matches seeded active customers count
            audienceReasoning: 'Engaged users who ordered within the last 90 days. Capturing active intent drives quick conversions.',
            channelRecommendation: 'SMS',
            channelReasoning: 'SMS provides a direct, urgent alert channel, capturing prompt attention for limited-time offers.',
            message: 'Hi {{name}}, weekend alert! Flash sale is live. Get 15% off storewide for the next 24 hours only. Use code FLASH15 at checkout.',
            cta: 'Claim 15% Off',
            expectedRevenue: 14000,
            reasoning: 'Urgency-driven promotions perform exceptionally on SMS as most messages are opened within 3 minutes of delivery.',
            segmentFilters: { segment: 'Active' }
        };
    }
    // Generate customer intelligence summary
    static async generateCustomerSummary(customer, orderHistory, communicationHistory) {
        if (openai) {
            try {
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an AI customer intelligence agent. Provide a single-sentence marketer summary for the customer based on their spend, order count, segment, last order date, and channel interaction history.'
                        },
                        {
                            role: 'user',
                            content: `Customer: ${customer.name}, Segment: ${customer.segment}, Spend: ₹${customer.totalSpend}, Orders: ${customer.ordersCount}, Last Order: ${customer.lastOrderDate ? customer.lastOrderDate.toISOString() : 'Never'}. Order history has ${orderHistory.length} records, communication history has ${communicationHistory.length} entries.`
                        }
                    ]
                });
                const summary = response.choices[0]?.message?.content;
                if (summary)
                    return summary.trim();
            }
            catch (err) {
                console.warn('[AI Service] OpenAI API customer summary error:', err.message);
            }
        }
        // Fallback generator
        const daysSinceLastOrder = customer.lastOrderDate
            ? Math.floor((new Date().getTime() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
            : 365;
        if (customer.segment === 'VIP') {
            return `Premium high-value VIP customer. Lifetime spend ₹${customer.totalSpend.toLocaleString()} across ${customer.ordersCount} orders. Last ordered ${daysSinceLastOrder} days ago. Highly responsive to email-based private launches.`;
        }
        else if (customer.segment === 'Dormant') {
            return `Dormant customer. Lifetime spend ₹${customer.totalSpend.toLocaleString()} across ${customer.ordersCount} orders. Has not purchased in ${daysSinceLastOrder} days. Reactivates well with WhatsApp discounts.`;
        }
        else {
            return `Active, regular shopper. Lifetime spend ₹${customer.totalSpend.toLocaleString()} with ${customer.ordersCount} orders. Last ordered ${daysSinceLastOrder} days ago. Highly responsive to SMS flash promotions.`;
        }
    }
    // Generate marketing optimization suggestions
    static async generateAnalyticsInsights(sent, delivered, opened, clicked, converted, revenue) {
        if (openai) {
            try {
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an AI growth marketer. Analyze the campaign funnel: Sent, Delivered, Opened, Clicked, Converted, and Revenue. Return a JSON array containing 3 distinct, actionable bulleted optimization tips.'
                        },
                        {
                            role: 'user',
                            content: `Funnel - Sent: ${sent}, Delivered: ${delivered}, Opened: ${opened}, Clicked: ${clicked}, Converted: ${converted}, Revenue: ₹${revenue}`
                        }
                    ],
                    response_format: { type: "json_object" }
                });
                const content = response.choices[0]?.message?.content;
                if (content) {
                    const parsed = JSON.parse(content);
                    if (Array.isArray(parsed.insights))
                        return parsed.insights;
                    if (Array.isArray(parsed.tips))
                        return parsed.tips;
                    if (Array.isArray(parsed))
                        return parsed;
                }
            }
            catch (err) {
                // Continue to fallback
            }
        }
        // Fallback tips
        const openRate = opened / (delivered || 1);
        const clickRate = clicked / (opened || 1);
        const convRate = converted / (clicked || 1);
        const tips = [];
        if (openRate < 0.4) {
            tips.push('Email open rates are below average (under 40%). Consider implementing personalized subject lines and optimizing the send timeline.');
        }
        else {
            tips.push('Open rates are solid. Retain momentum by testing interactive elements like WhatsApp Quick Reply buttons to increase customer replies.');
        }
        if (clickRate < 0.15) {
            tips.push('Click-through rates (CTR) on messages are lagging. Inject stronger, urgency-driven Call to Action (CTA) messaging (e.g., "Valid for 2 Hours Only").');
        }
        else {
            tips.push('Excellent CTR. Keep copy concise and ensure the link lands directly on the specific product collection page to minimize drop-off.');
        }
        if (convRate < 0.08) {
            tips.push('Conversion drop-off at checkout is high. Implement a cart recovery automated SMS triggered 30 minutes post-abandonment.');
        }
        else {
            tips.push('Conversion efficiency is healthy. Test bundled product recommendations on checkout pages to increase average order values (AOV).');
        }
        return tips;
    }
}
exports.AIService = AIService;
