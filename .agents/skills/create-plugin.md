# Create Custom Plugin — erxes AI Native Scaffolding Playbook

This playbook guides an AI agent through creating a brand new, fully functional plugin within the erxes monorepo, complete with backend API (`_api`), frontend UI (`_ui`), test suites, and integration with the `.agents` playbook and routing system.

---

# Playbook Initialization

> **When to use:** When the developer runs `erxes-wish` with the `--plugin` attribute or requests a fresh new plugin.

---

## Non-Negotiable Scaffolding Rules

To declare a new plugin successful, you must satisfy the following **12 Strict Goal Conditions**:

1. **Test Verification**: Every single test script inside the new plugin workspace (`backend` & `frontend`) must work and pass completely.
2. **Pure-Graph Seeding**: The plugin must seed its own initial database records *without* requiring direct database inserts/access or asking the developer to perform manual setups. **Always use GraphQL queries and mutations to seed the data.**
3. **Eval Compliance**: The new plugin must pass all checks run by `.agents/evals/run.sh <plugin>`.
4. **Zero Redundancy**: Avoid code redundancy. Shared helpers, models, and types must be clean and localized or properly imported from central core-libraries.
5. **Strict TypeScript Interfaces**: Declare all object schemas, entities, payloads, and structures using TypeScript `interface` blocks. **Do not use the `type` keyword for objects.**
6. **Robust JSDoc**: Write descriptive JSDoc comments for all exported classes, methods, functions, variables, and interfaces.
7. **Playwright Integration**: Implement operational Playwright e2e/smoke tests under the new plugin's `tests/` directory verifying full UI-to-API connectivity.
8. **Git Cleanliness (Auto-Gitignore)**: Since the new plugin is dynamic and custom-added, you must automatically append its directories to the root [`.gitignore`](file:///Users/Amaraa0404/Documents/projects/erxes-ai-native-org/.gitignore):
   ```gitignore
   # Dynamically created plugin: <plugin-name>
   backend/plugins/<plugin-name>_api/
   frontend/plugins/<plugin-name>_ui/
   .agents/plugins/<plugin-name>/
   .agents/skills/<plugin-name>/
   ```
9. **`.agents` Compatible**: The new plugin must be fully compatible with the `.agents` ecosystem. You must create the `.agents/plugins/<plugin-name>/INDEX.md` file and build basic task playbooks under `.agents/skills/<plugin-name>/` so it is instantly indexable.
10. **Extensible Developer Rules**: Adopt and respect any extra developer-defined design patterns or code rules encountered in the active workspace.
11. **Port Selection & No-Collision**: A new plugin must NEVER reuse a port that is already occupied by any other backend or frontend plugin. You MUST actively scan all existing plugins (under `backend/plugins/` and `frontend/plugins/`) via their `main.ts`, `project.json`, `vite.config.ts`, `rspack.config.ts`, or `webpack.config.js` to identify occupied ports, and select a guaranteed free and unique port for both the backend (typically starting from `3301` upward) and the frontend dev server (typically starting from `3001` upward).
12. **Notification Widget Requirement**: A new plugin must construct a custom Notification Widget exposed via Webpack Module Federation as `./notificationWidget`. This widget must be designed to dynamically introduce all the plugin's new features to end users once the plugin is active, serving as the user-facing onboarding and announcements hub.

---

## Detailed Step-by-Step Execution Workflow

### Step 1 — Gather Specifications & Check Free Ports
When triggered, clarify the following details with the developer directly in the chat interface:
- **Plugin Name** (e.g., `booking`, `loyalty`, `marketing`).
- **Core Entities & Database Fields** (e.g., `voucherCode`, `expiryDate`, `discountPercent`).
- **Required GraphQL Operations** (queries to read, mutations to write).

**Verify & Select Ports:**
- Search all `backend/plugins/*/src/main.ts` files for `port: <number>` to compile a list of taken backend ports.
- Search all `frontend/plugins/*/project.json` files for `"port": <number>` to compile a list of taken frontend dev server ports.
- Select a unique, unallocated port for the backend (e.g., `3316` if `3315` is the highest) and for the frontend (e.g., `3016` if `3008` is the highest).

### Step 2 — Backend API Scaffolding (`backend/plugins/<plugin>_api/`)
1. Create the backend plugin directory under `backend/plugins/<plugin>_api/`.
2. Establish a `project.json` for Nx.
3. **Database Models (`src/models.ts`)**: Define Mongoose schemas for core entities. Wrap all paths using `generateModels(subdomain)` to ensure strict multi-tenancy.
4. **GraphQL Service (`src/graphql/`)**:
   - `typeDefs.ts`: Define federated schemas.
   - `resolvers.ts`: Implement queries and mutations. Make sure to define standard write mutations that can be used for automated seeding.
5. **tRPC Procedures (`src/trpc.ts`)**: Define procedures for internal microservice calls.
6. **Main entrypoint (`src/main.ts`)**: Wire the Fastify sub-app and register handlers using the unique, checked free port (via `startPlugin({ name: '<plugin-name>', port: <unique-free-port>, ... })`).
7. **Notification Registry (`src/meta/notifications.ts`)**: Define notification events and metadata in the plugin metadata.

### Step 3 — Frontend UI Scaffolding (`frontend/plugins/<plugin>_ui/`)
1. Create the frontend directory under `frontend/plugins/<plugin>_ui/`.
2. Configure `project.json` to run the dev server on the unique, checked free port.
3. Configure Webpack Module Federation to expose the new plugin modules, including:
   - Expose `./notificationWidget` pointing to `./src/widgets/notifications/NotificationRemoteEntries.tsx`.
4. Build the core React components using CSS:
   - Dashboard page showing listing tables.
   - Creation/edit forms.
5. **Build the Notification Widget (`src/widgets/notifications/NotificationRemoteEntries.tsx`)**: Build a beautiful React component that acts as the onboarding widget, listing and explaining all the new features and entity interactions introduced by this plugin.
6. Integrate the Apollo Client and Zod schema validations for the form submission.

### Step 4 — Automated Seeding & Testing
1. **Automated Seeding**: Write a seeding script (e.g. `scripts/seed.ts` or as part of the setup) that triggers the GraphQL mutations (e.g., `loyaltyVouchersAdd(...)`) to establish starting records automatically.
2. **Write Playwright Spec**: Create an end-to-end spec in `.agents/plugins/<plugin>/tests/` that loads the React route and performs basic smoke-test workflows, including validating the notification widget.
3. **Register Workspace**: Append packages to `pnpm-workspace.yaml` and `nx.json`. Run `pnpm install` inside the monorepo root.

### Step 5 — Gitignore Registration
Open the root [`.gitignore`](file:///Users/Amaraa0404/Documents/projects/erxes-ai-native-org/.gitignore) and append the ignored paths for the new custom plugin at the bottom of the file.

### Step 6 — Indexing & Verification
1. Create `.agents/plugins/<plugin>/INDEX.md` defining your new module boundaries.
2. Populate initial playbook skills under `.agents/skills/<plugin>/`.
3. Add the playbooks to the semantic index database in `.agents/skills/.index` so the newly created plugin is ready for future development sessions.
4. Run validation:
   ```bash
   .agents/evals/run.sh <plugin>
   ```
