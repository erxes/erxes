# Fix/Resolve Plugin Issue — erxes AI Native Bug-Fixing Playbook

This playbook guides an AI agent through reproducing, isolating, and fixing reported issues, errors, or bugs in any monorepo plugin, ensuring full verification and zero regressions.

---

# Playbook Initialization

> **When to use:** When the developer runs `erxes-wish` with the `--fix` attribute or when a bug report/error is detected in their wish.

---

## Non-Negotiable Bug-Fixing Rules

To declare a bug resolution successful, you must satisfy the following **7 Core Scaffolding Principles**:

1. **Localization & Isolation**: Proactively locate the bug using codebase search and grep tools before making any changes. Validate exactly which files and lines of code contain the faulty logic.
2. **Regression Testing**: Write a failing unit test or extend the Playwright e2e/smoke tests inside the plugin's `tests/` directory to reproduce the bug *before* applying the fix. Verify the test passes completely *after* your changes.
3. **Pure-Graph Seeding**: Setting up initial state for verification or tests must only use GraphQL queries and mutations. **Do not perform direct database manipulation.**
4. **Eval Compliance**: The fixed plugin must pass all checks run by `.agents/evals/run.sh <plugin>`.
5. **Clean Codestyle**:
   - Zero code redundancy.
   - Strictly use TypeScript **interfaces** for all objects and structures (forbid the `type` keyword for object formats).
   - Write clear **JSDoc comments** detailing the reasons behind the fix.
6. **Zero Side-effects**: Fixes must respect the strict multi-tenancy architecture. Never bypass `generateModels(subdomain)` or hardcode connections.
7. **Atomic Commits**: Keep changes extremely small (under 50 LOC per commit) and stage them in logical steps.

---

## Detailed Step-by-Step Execution Workflow

### Step 1 — Analyze and Locate the Bug
1. Parse the developer's bug report carefully. Look for error logs, stack traces, or step-by-step descriptions of the faulty behavior.
2. Search the codebase for key terms, method names, or endpoints using `grep_search`.
3. Read the relevant files using `view_file` to understand the current logic.

### Step 2 — Reproduce and Write a Test Spec
1. Locate the test folder for the target plugin (e.g. `.agents/plugins/<plugin>/tests/` or `.agents/plugins/<plugin>/modules/`).
2. Write a minimal Playwright e2e spec or Jest test that exposes the issue (e.g. submitting a form with negative values, or requesting a field with missing context).
3. Run the test to ensure it fails as expected.

### Step 3 — Implement the Fix
1. Apply the correction precisely.
2. Ensure you adhere to all typings, and wrap schemas correctly in multi-tenant contexts.
3. Document the modified methods/classes with clear JSDoc comments explaining what was corrected and why.

### Step 4 — Verify Pure-Graph Seeding
1. If your test or verification requires seeding initial data, trigger only GraphQL mutations (e.g. `dealsAdd`, `ticketsAdd`, `invoicesAdd`) in your script.
2. Ensure no direct database connections or scripts bypass the API gateway.

### Step 5 — Verify and Pass Evals
1. Run the local tests to ensure the reproduction spec now passes.
2. Run the main evaluation suite:
   ```bash
   .agents/evals/run.sh <plugin>
   ```
3. Ensure no regressions occur in any other parts of the monorepo.
