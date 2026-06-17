---
name: detect-scope
description: Detects user request intent, identifies target plugin/module, loads relevant code context, and asks minimal informed questions before proceeding to intake.
---

# Skill: Detect Scope

## When to Use

**ALWAYS** use this skill immediately after `assemble-context` and **BEFORE** `intake`.

This skill runs silent discovery on the user's request so that subsequent questions are informed, precise, and don't waste time on obvious matters.

## Workflow

### Step 1: Parse User Request

Analyze the raw request for:
- **Action type**: `create` | `modify` | `fix` | `delete` | `improve` | `create-new-plugin`
- **Target entity**: posts, deals, tasks, tickets, tags, etc.
- **Scope hints**: UI elements (page, table, form, button) → frontend; data/schema/model → backend; "new feature" → both
- **Plugin hints**: direct mentions (sales, content, operation, frontline, etc.)

### Step 2: Search Feature Map

Search `.agents/maps/feature-map.yaml` for exact or fuzzy matches:

```bash
# Search by keywords
grep -i "keyword" .agents/maps/feature-map.yaml

# Search by plugin name
grep -i "plugin: {plugin}_ui" .agents/maps/feature-map.yaml
```

**If exact match found:**
- Extract plugin, module, components, routes, entities
- Note whether frontend/backend/both exists in the mapping

**If no match found:**
- Infer plugin from keywords or ask user directly: "Which plugin area does this belong to?"
- Mark scope as `needs-clarification`

### Step 3: Determine Action Classification

| Request Pattern | Classification | Auto-detected Scope |
|---|---|---|
| "Add/create new X" | `create` | Usually frontend + backend |
| "Fix X" / "X is broken" | `fix` | Minimal (wherever bug manifests) |
| "X looks bad / UI issue" | `fix` | Frontend only |
| "X is slow / timeout" | `fix` | Backend only |
| "Update/improve X" | `modify` | Frontend + Backend |
| "Remove/delete X" | `delete` | Frontend + Backend |
| "Build new plugin for X" | `create-new-plugin` | Full scaffold |

### Step 4: Load Plugin Context

**Read plugin AGENTS.md if exists:**
```bash
test -f frontend/plugins/{plugin}_ui/AGENTS.md && cat frontend/plugins/{plugin}_ui/AGENTS.md
test -f backend/plugins/{plugin}_api/AGENTS.md && cat backend/plugins/{plugin}_api/AGENTS.md
```

**Explore plugin structure:**
```bash
# Frontend plugin modules
ls frontend/plugins/{plugin}_ui/src/modules/ 2>/dev/null || echo "No frontend plugin"

# Backend plugin modules
ls backend/plugins/{plugin}_api/src/ 2>/dev/null || echo "No backend plugin"
```

**Find similar existing implementations:**
```bash
# Find existing RecordTable, Form, or page in same plugin
grep -r "RecordTable" frontend/plugins/{plugin}_ui/src/modules/{module}/ --include="*.tsx" -l 2>/dev/null | head -5

# Find existing GraphQL operations
grep -r "gql\|graphql" backend/plugins/{plugin}_api/src/ --include="*.ts" -l 2>/dev/null | head -5
```

### Step 5: Build Preliminary Scope

Synthesize findings into:

```text
Detected Scope:
  Plugin: {plugin_name}
  Module: {module_name}
  Action: {create|modify|fix|delete|create-new-plugin}
  Scope: {frontend|backend|both}
  Existing Components: [...]
  Similar Implementations: [...]
```

### Step 6: Ask Minimal Informed Questions

**DO NOT ask:**
- "Which plugin?" (already detected)
- "Frontend or backend?" (already inferred)
- "What components do you need?" (we know the patterns)

**DO ask:**

1. **Scope Confirmation** (1 sentence):
   ```text
   I'll {action} {feature} in the {plugin} plugin ({module} module). 
   Scope: {frontend/backend/both}. Is this correct?
   ```

2. **Goal Condition** (1 question):
   ```text
   What does "done" look like for you? Any specific behavior, design, or constraint I should know?
   ```

3. **Reference Preference** (optional, if similar implementations exist):
   ```text
   I found {similar_feature} in the same plugin. Should I model this after it?
   ```

**If detection was uncertain**, ask ONE clarifying question:
```text
I detected {plugin}/{module}, but I'm not certain. Is this correct, or did you mean {alternative}?
```

### Step 7: Hand Off to Intake

Once user confirms scope and provides goal conditions:

1. Pass detected scope to `intake` skill:
   - `plugin`: confirmed plugin
   - `module`: confirmed module
   - `action`: create|modify|fix|delete|create-new-plugin
   - `scope`: frontend|backend|both
   - `goal_condition`: user's answer about "done"
   - `similar_impl`: reference implementation path (if found)

2. The `intake` skill will then build the component checklist without asking redundant questions.

## Examples

### Example 1: Clear Request

**User:** "Add tags to posts"

**LLM (detect-scope):**
1. Parse: action=create, entity=tags, hints=posts (content plugin)
2. Feature map: matches `tags` domain=content, module=cms/tags
3. Classification: create → scope=both
4. Load context:
   - Read `frontend/plugins/content_ui/AGENTS.md` (if exists)
   - List `frontend/plugins/content_ui/src/modules/cms/` contents
   - Find similar: `categories` module has `CategoriesRecordTable`, `CategoryForm`
5. Ask:
   ```text
   I'll add tags to the content plugin (cms/tags module). Scope: frontend + backend. Is this correct?
   
   What does "done" look like? (e.g., tag management page, tag selector in post form, both?)
   
   I found the categories feature as a similar implementation. Should I model tags after it?
   ```

**User:** "Yes, and yes model after categories. I need a tag page and selector in post form."

**LLM:** Proceeds to `intake` with confirmed scope.

### Example 2: Fix Request

**User:** "Fix deal pipeline board - cards not dragging"

**LLM (detect-scope):**
1. Parse: action=fix, entity=pipeline board, hints=deal (sales plugin)
2. Feature map: matches `pipelines` domain=sales, module=pipelines
3. Classification: fix → scope=frontend (UI issue: "not dragging")
4. Load context:
   - Read `frontend/plugins/sales_ui/AGENTS.md`
   - Find `PipelineBoard` component
   - Check drag-and-drop library usage
5. Ask:
   ```text
   I'll fix the deal pipeline board drag-and-drop in the sales plugin. Scope: frontend only. Is this correct?
   
   What does "fixed" look like? Smooth drag-and-drop between stages, or specific edge case?
   ```

### Example 3: New Plugin Request

**User:** "Build a warehouse plugin for inventory management"

**LLM (detect-scope):**
1. Parse: action=create-new-plugin, entity=warehouse/inventory
2. Feature map: no match for "warehouse"
3. Classification: create-new-plugin
4. Check manifest: no `warehouse` plugin exists
5. Ask:
   ```text
   I'll create a new "warehouse" plugin for inventory management. This will scaffold both frontend (warehouse_ui) and backend (warehouse_api). Is this correct?
   
   What does "done" look like? (e.g., basic CRUD for products, stock tracking, warehouse locations?)
   ```

### Example 4: Ambiguous Request

**User:** "Add custom fields to products"

**LLM (detect-scope):**
1. Parse: action=create, entity=custom fields, hints=products (sales plugin)
2. Feature map: `custom_fields` domain=content (not sales!)
3. Classification: modify (adding to existing entity)
4. Ask:
   ```text
   I detected custom fields for the content plugin (custom fields are managed centrally and applied to products via config). Is this correct, or do you want product-specific custom fields in the sales plugin?
   ```

## Important Rules

1. **ALWAYS search feature-map first** - don't guess the plugin
2. **ALWAYS read plugin AGENTS.md** if it exists
3. **ALWAYS find similar implementations** in the same plugin before asking questions
4. **NEVER ask more than 3 questions** - detection should handle the rest
5. **NEVER start coding** - hand off to intake after confirmation
6. **If creating a new plugin**, check manifest registry and confirm the name doesn't exist
7. **Pass all context** to intake so it can build checklist immediately

## Output Format

When handing off to intake, provide:

```yaml
detected_scope:
  plugin: "content"
  module: "cms/tags"
  action: "create"
  scope: "both"
  frontend_plugin: "content_ui"
  backend_plugin: "content_api"
  existing_similar:
    - plugin: "content"
      module: "cms/categories"
      components: ["CategoriesRecordTable", "CategoryForm"]
  goal_condition: "User wants tag management page + tag selector in post form"
  user_confirmed: true
```

### CRITICAL: Write State File

**detect-scope MUST write its output to:**
`.agents/state/last-detect-scope.json`

This file is validated by the pre-flight check script before intake can run.

**Example state file:**
```json
{
  "plugin": "content",
  "module": "cms/tags",
  "action": "create",
  "scope": "both",
  "frontend_plugin": "content_ui",
  "backend_plugin": "content_api",
  "existing_similar": [
    {
      "plugin": "content",
      "module": "cms/categories",
      "components": ["CategoriesRecordTable", "CategoryForm"]
    }
  ],
  "goal_condition": "Tag management page + tag selector in post form",
  "user_confirmed": true,
  "timestamp": "2026-05-29T12:00:00Z"
}
```

**Without this file, intake will FAIL the pre-flight check and cannot proceed.**

## Related Skills

- `assemble-context` - Must run before this skill
- `intake` - Receives output from this skill
- `create-plugin` - Used when action=create-new-plugin
- `plugin-workflow` - Used after intake for execution
