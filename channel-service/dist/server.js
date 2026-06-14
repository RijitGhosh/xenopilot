"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 5001;
// Helper function to send status callback to CRM backend
async function sendCallback(url, payload) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            console.error(`Callback failed: ${payload.type} for communication ${payload.communicationId}, status: ${response.status}`);
        }
    }
    catch (error) {
        console.error(`Error sending callback to CRM backend: ${error.message}`);
    }
}
// Simulate message life-cycle in the background
function simulateMessageLifecycle(body) {
    const { channel, communicationId, crmCallbackUrl = 'http://localhost:5000/api/receipts' } = body;
    const triggerEvent = (type, delay, metadata) => {
        setTimeout(async () => {
            console.log(`[Simulator] ${channel} -> ${type} for Comm ID: ${communicationId}`);
            await sendCallback(crmCallbackUrl, {
                communicationId,
                type,
                timestamp: new Date().toISOString(),
                metadata,
            });
        }, delay);
    };
    // 1. Send Event (Immediate)
    triggerEvent('SENT', 100);
    // Determine if message fails
    const failureChance = channel === 'EMAIL' ? 0.05 : channel === 'SMS' ? 0.08 : 0.03;
    const isFailed = Math.random() < failureChance;
    if (isFailed) {
        triggerEvent('FAILED', 800);
        return;
    }
    // 2. Delivered Event (0.5s to 1.5s delay)
    const deliveryDelay = Math.floor(Math.random() * 1000) + 500;
    triggerEvent('DELIVERED', deliveryDelay);
    // 3. Opened Event (channel-dependent click/open rates)
    // Open rate: WhatsApp (85%), RCS (70%), Email (30%), SMS (90% - read quickly but often ignored)
    let openRate = 0.30;
    if (channel === 'WHATSAPP')
        openRate = 0.85;
    if (channel === 'RCS')
        openRate = 0.70;
    if (channel === 'SMS')
        openRate = 0.80;
    const isOpen = Math.random() < openRate;
    if (!isOpen)
        return;
    const openDelay = deliveryDelay + Math.floor(Math.random() * 2000) + 1000;
    triggerEvent('OPENED', openDelay);
    // 4. Clicked Event
    // Click rate (given opened): WhatsApp (35%), RCS (25%), Email (12%), SMS (8%)
    let clickRate = 0.12;
    if (channel === 'WHATSAPP')
        clickRate = 0.35;
    if (channel === 'RCS')
        clickRate = 0.25;
    if (channel === 'SMS')
        clickRate = 0.08;
    const isClicked = Math.random() < clickRate;
    if (!isClicked)
        return;
    const clickDelay = openDelay + Math.floor(Math.random() * 3000) + 1500;
    triggerEvent('CLICKED', clickDelay);
    // 5. Converted Event (given clicked)
    // Conversion rate: 15% across all channels if they clicked
    const isConverted = Math.random() < 0.15;
    if (!isConverted)
        return;
    const convertDelay = clickDelay + Math.floor(Math.random() * 4000) + 2000;
    const purchaseAmount = Math.floor(Math.random() * 2500) + 500; // Rs 500 - 3000
    triggerEvent('CONVERTED', convertDelay, { revenue: purchaseAmount });
}
// POST /send endpoint
app.post('/send', (req, res) => {
    const { recipient, message, channel, communicationId } = req.body;
    if (!recipient || !message || !channel || !communicationId) {
        res.status(400).json({ error: 'Missing required parameters: recipient, message, channel, communicationId' });
        return;
    }
    console.log(`[Simulator] Received send request for ${recipient} via ${channel}`);
    // Trigger simulated lifecycle asynchronously
    simulateMessageLifecycle(req.body);
    res.status(202).json({
        status: 'accepted',
        message: 'Message simulation initiated',
        communicationId,
    });
});
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'channel-service-simulator' });
});
app.listen(PORT, () => {
    console.log(`[Channel Service Simulator] Running on port ${PORT}`);
});
