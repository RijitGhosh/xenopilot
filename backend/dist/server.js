"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Import routes
const customers_js_1 = __importDefault(require("./routes/customers.js"));
const campaigns_js_1 = __importDefault(require("./routes/campaigns.js"));
const receipts_js_1 = __importDefault(require("./routes/receipts.js"));
const ai_js_1 = __importDefault(require("./routes/ai.js"));
const analytics_js_1 = __importDefault(require("./routes/analytics.js"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Logging Middleware
app.use((req, res, next) => {
    console.log(`[Backend API] ${req.method} ${req.url}`);
    next();
});
// Register API Routes
app.use('/api/customers', customers_js_1.default);
app.use('/api/campaigns', campaigns_js_1.default);
app.use('/api/receipts', receipts_js_1.default);
app.use('/api/ai', ai_js_1.default);
app.use('/api/analytics', analytics_js_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', service: 'xenopilot-backend-api' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Global Error Handler]', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});
// Start Express server
app.listen(PORT, () => {
    console.log(`[XenoPilot Backend API] Running on http://localhost:${PORT}`);
});
