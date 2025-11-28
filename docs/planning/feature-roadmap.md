# AgentVerse Feature Roadmap

This document serves as the single source of truth for the AgentVerse product vision, tracking both completed features and the future roadmap.

---

## ✅ Implemented Features (Phase 1-3)

These features form the foundation of the AgentVerse platform.

### Core UX & Functionality
- **Draggable Agent Cards:** Agents can be intuitively managed by dragging and dropping them between the Agent Pool and various Teams.
- **Dynamic Team Formation:** Users can create, name, and populate multiple agent teams in columns.
- **Agent Creation & AI-Assisted Profiling:** Users can create new agents from scratch, with an option to use AI to generate detailed objectives based on a simple role description.
- **Custom Tool Schema Suggestion:** Provides AI assistance to generate a JSON schema for a new, user-described tool.

### 🚀 Phase 1: Deepened Preset Library
- **Industry-Grade Presets:** Expanded the library to include 20+ ready-to-use presets across five key verticals: Marketing, Software Engineering, Product Management, Finance, and Healthcare.
- **Complex Multi-Agent Teams:** Presets are designed as realistic workflows, featuring teams of 3-7 agents with specific, collaborative roles.

### 🎭 Phase 2: Enhanced Core UX & Visualization
- **Agent Memory Inspector:** Agent cards are clickable, opening a dialog that displays the agent's detailed profile, including its role, objectives, constraints, and assigned tools.
- **"Run in Steps" / Debug Mode (Simulation):** Orchestration results are streamed token-by-token with clear labeling for which agent is "acting." This creates a live, step-by-step view of the collaboration process.

### 🔐 Phase 3: Enterprise & Trust Features (Foundational)
- **Execution Logs & Traceability:** A "Download Log" button allows users to save a complete, timestamped Markdown file of any orchestration result for auditing and record-keeping.
- **"Deterministic Mode" (Hard Constraint Engine):** A "Strict Mode" toggle gives users control over AI creativity, instructing the agent team to adhere literally to their objectives for more predictable and reliable outputs.

---

## 🎯 Unique Selling Propositions (USPs) - Future Roadmap

These are the next-generation features designed to capture the market and provide a significant competitive advantage over existing frameworks and tools.

### 1. Live Visual Orchestration & Debugging
- **Vision:** Transform the dashboard into a live, interactive canvas ("Miro for AI agents").
- **Features:**
    - Real-time highlighting of the currently "thinking" agent.
    - Dynamic arrows drawn between agents to visualize message passing.
    - Clickable arrows to inspect the data payload being passed.
    - Visual error states (e.g., a card turning red) to instantly identify bottlenecks.
- **Competitive Edge:** Unparalleled transparency and intuitive debugging that no competitor offers visually.

### 2. Human-in-the-Loop (HITL) Control
- **Vision:** Empower users to actively steer and correct agent workflows.
- **Features:**
    - A "Run with Pauses" mode that stops at predefined checkpoints.
    - An approval gate where users can **Approve**, **Edit**, or **Redirect** an agent's output before it proceeds.
- **Competitive Edge:** Moves beyond simple automation to true human-AI collaboration, building trust and enabling use in high-stakes, mission-critical tasks.

### 3. Tool Creation & Integration Marketplace
- **Vision:** Evolve from a tool-using platform to a tool-creating ecosystem ("Zapier for AI agents").
- **Features:**
    - An in-app, form-based builder to define custom tools and connect them to real API endpoints.
    - A private organizational tool registry.
    - A public "AgentVerse Marketplace" for users to share and discover tools.
- **Competitive Edge:** Creates a powerful network effect and makes AgentVerse the central hub for integrating enterprise systems with AI workflows.

### 4. Persistent Agent Memory & Learning
- **Vision:** Enable agents to learn from experience and improve over time.
- **Features:**
    - A persistent memory layer (e.g., vector database) for each agent instance.
    - Agents can be instructed to "recall past work" to inform new tasks, avoid repeating mistakes, and maintain long-term context.
- **Competitive Edge:** Solves the "agent amnesia" problem. An agent that learns and adapts to a user's specific domain is exponentially more valuable.

### 5. One-Click Deployment to Production
- **Vision:** Bridge the gap between designing a workflow and using it in a real-world application.
- **Features:**
    - A "Deploy" button that wraps a finalized agent team and workflow into a single, secure API endpoint.
    - This allows external applications to call the multi-agent system as a service.
- **Competitive Edge:** Offers the ultimate "solution, not just a tool." It abstracts away all backend infrastructure, enabling businesses to integrate sophisticated AI orchestration into their products with a simple API call.
