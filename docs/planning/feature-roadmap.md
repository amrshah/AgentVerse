# AgentVerse Feature Roadmap

This document serves as the single source of truth for the AgentVerse product vision, tracking both completed features and the future roadmap.

---
## Version 0.0.1: Initial Prototype

This version establishes the core mechanics of agent creation, team formation, and AI-driven orchestration.

### ✅ Implemented Features (Phase 1-3)

These features form the foundation of the AgentVerse platform.

- **Draggable Agent Cards:** Agents can be intuitively managed by dragging and dropping them between the Agent Pool and various Teams.
- **Dynamic Team Formation:** Users can create, name, and populate multiple agent teams in columns.
- **Agent Creation & AI-Assisted Profiling:** Users can create new agents from scratch, with an option to use AI to generate detailed objectives based on a simple role description.
- **Custom Tool Schema Suggestion:** Provides AI assistance to generate a JSON schema for a new, user-described tool.
- **Expanded Preset Library:** Includes 20+ ready-to-use presets across five key verticals: Marketing, Software Engineering, Product Management, Finance, and Healthcare.
- **Agent Memory Inspector:** Agent cards are clickable, opening a dialog that displays the agent's detailed profile.
- **"Run in Steps" / Debug Mode (Simulation):** Orchestration results are streamed token-by-token with clear labeling for which agent is "acting."
- **Execution Logs & Traceability:** A "Download Log" button allows users to save a complete, timestamped Markdown file of any orchestration result.
- **"Deterministic Mode" (Hard Constraint Engine):** A "Strict Mode" toggle gives users control over AI creativity for more predictable outputs.
- **Customizable AI Settings:** A settings dialog allows users to change the AI model, temperature, and other parameters.

---

## 🎯 Version 0.1.0 and Beyond: The Platform Phase

This next major version will transform AgentVerse from a standalone tool into a collaborative, multi-user platform.

### **Phase 4: Foundational Backend & Authentication**
- **Goal**: Integrate a robust user authentication system to support individual and team-based features.
- **Features**:
    - Set up Firebase Authentication with Google Sign-In.
    - Create UI for Login/Logout.
    - Establish a `users` collection in Firestore to store user profiles.
    - Implement security rules to protect user data.

### **Phase 5: Organizations & Teams**
- **Goal**: Enable users to form and manage secure teams within an organizational context.
- **Features**:
    - Data models for `organizations` in Firestore.
    - UI for creating an organization.
    - Functionality for inviting members to an organization.
    - Basic role management (e.g., owner, member).

### **Phase 6: Personal & Shared Libraries**
- **Goal**: Transition from static, hard-coded data to a dynamic, user-driven library system for agents and orchestrations.
- **Features**:
    - Migrate agents and orchestration presets to Firestore collections.
    - Implement "Save as..." functionality for agents and orchestration presets.
    - Create UI for browsing personal and organizational libraries.
    - Develop a "publish" workflow for sharing custom agents/presets with an organization.

### **Future Unique Selling Propositions (USPs)**

These are the next-generation features to be prioritized after the platform foundation is built.

- **1. Live Visual Orchestration & Debugging:** A "Miro for AI agents" experience with real-time visualization of agent collaboration.
- **2. Human-in-the-Loop (HITL) Control:** Allow users to pause, edit, and redirect agent workflows in real-time.
- **3. Tool Creation & Integration Marketplace:** An in-app builder and marketplace for creating and sharing custom tools.
- **4. Persistent Agent Memory & Learning:** Enable agents to learn from past runs to improve performance over time.
- **5. One-Click Deployment to Production:** Wrap a finalized agent team into a single, deployable API endpoint.
