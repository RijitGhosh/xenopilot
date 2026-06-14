# XenoPilot Video Walkthrough Script

This script outlines a complete **5–6 minute demonstration** of XenoPilot for engineering interviewers. It presents the product vision, runs through the key user scenarios, explains the architecture, performs a codebase walkthrough, and analyzes scaling strategies.

---

## Section 1: Product Introduction (0:00 - 1:00)

**[Visual: Presenter on camera or showing XenoPilot landing screen / Dashboard]**

> "Hi everyone, I’m presenting **XenoPilot**, an AI-first CRM and Marketing Agent built for consumer brands. 
> 
> Traditional CRMs are database-heavy, requiring marketers to manually define queries, coordinate copywriters, compile email assets, and aggregate analytics. XenoPilot flips this model. It is designed around an AI-native workflow: the marketer enters a high-level goal in natural language, and XenoPilot takes care of segmenting the audience, recommending the optimal channel, generating targeted copywriting, simulating dispatches, and providing attributed sales analytics in real-time.
> 
> Let's dive into the live app to see how it works."

---

## Section 2: Product Demo (1:00 - 2:30)

**[Visual: Dashboard Page with metrics and charts]**

> "Here is our Executive Dashboard, featuring core KPIs: Total Audience Reach, Active Pilots, Attributed Revenue, and Conversion Rate. You can immediately see the AI Insights feed suggesting strategy changes based on real data. 
> 
> Let’s navigate to the **AI Campaign Builder** page."

**[Visual: Marketer enters prompt "Bring back customers who have not purchased in 90 days." and clicks "Generate Campaign"]**

> "I will input our goal: *'Bring back customers who have not purchased in 90 days.'* 
> 
> Once generated, XenoPilot analyzes our database, determines a matching target segment, and recommends the **WhatsApp** channel. It provides the reasoning—WhatsApp achieves a 98% open rate for dormant segments—and outputs custom, personalized copy with a strong discount coupon. We also see a live phone mock rendering the WhatsApp message bubble exactly as it will appear.
> 
> Let's hit **Launch Pilot Campaign**."

**[Visual: Clicks Launch. Live dispatch card starts ticking up sent/delivered counts]**

> "Under the hood, XenoPilot logs a campaign in our database, extracts target customer profiles, and fires dispatch requests to our dedicated channel service. As callbacks stream back from the simulator, we see live delivery and conversion metrics update on our screen in real-time."

**[Visual: Navigate to Customers CRM, click on a customer to open drawer]**

> "If we inspect our **Customers CRM**, we get a full table of profiles. Clicking on Amit Sharma slides open a side drawer dossier. Here, we see their transaction history, campaign interactions, and an **AI Customer Summary** summarizing their value and preferred discount channels."

---

## Section 3: Architecture & System Design (2:30 - 3:30)

**[Visual: Display Architecture Diagram (or project files)]**

> "XenoPilot is structured as a robust, decoupled three-tier system:
> 
> 1. **Next.js 15 Client**: Built with TypeScript and Tailwind CSS, utilizing React Query for client state management and Recharts for graphs.
> 2. **Node.js/Express Backend**: Interacting with our SQLite database (local dev) or Neon PostgreSQL (production) via Prisma ORM.
> 3. **Channel Service Simulator**: A separate Express microservice simulating multi-channel delivery. When it receives a dispatch, it runs an async lifecycle pipeline, calling back our CRM webhook receipts API with SENT, DELIVERED, OPENED, CLICKED, and CONVERTED events.
> 
> When a conversion is registered, our attribution engine automatically writes an Order record for the customer, updates customer aggregates (lifetime spend and order count), and reflects the revenue on our dashboard—closing the loop on campaign ROI."

---

## Section 4: Code Walkthrough (3:30 - 4:45)

**[Visual: Code editor showing prisma schema and receipts.ts router]**

> "Let's look at the codebase. In our Prisma schema, we define relational models connecting `Customer`, `Order`, `Campaign`, `Communication`, and `Event`.
> 
> Now, look at our receipts webhook endpoint `/api/receipts` in the backend. When a webhook lands, we create an Event and update the Communication log. 
> 
> Crucially, if the event is a `CONVERTED` status, the attribution logic retrieves the transaction amount, inserts a new `Order`, and aggregates the customer’s lifetime spend. This guarantees that customer profiles and dashboard charts update instantly as the campaign progresses.
> 
> In `ai.service.ts`, we implement a hybrid engine. If an OpenAI key is configured, it calls `gpt-4o-mini` with structured JSON outputs. If no key is set, it falls back to a smart local rule engine, allowing the app to run completely out-of-the-box with high-fidelity mock proposals."

---

## Section 5: Scalability & Production Readiness (4:45 - 5:30)

**[Visual: Slides or README detailing scalability topics]**

> "To make this system ready for enterprise scale:
> 
> 1. **Message Queuing**: Instead of firing dispatches via HTTP, we would push jobs to a distributed queue like **BullMQ/Redis** or **Kafka** to handle massive campaign spikes without blocking the main event loop.
> 2. **Idempotency**: Webhook receipts will carry unique event IDs to prevent double-crediting orders if webhooks are retried.
> 3. **Horizontal Scaling**: Decoupling the channel microservice allows us to scale out dispatch workers independently from database-heavy CRM route queries.
> 
> This completes the walkthrough of XenoPilot. It’s an end-to-end, functional prototype demonstrating modern AI integration and solid system design. Thank you!"
