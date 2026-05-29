---
name: intake
description: Requirement gathering and scope confirmation. ALWAYS use this skill first before any development work. Maps user requests to erxes features and confirms scope.
---

# Skill: Task Intake

## When to Use

**ALWAYS** use this skill first, before any coding skill.

**DO NOT** start coding until:
1. Scope is identified
2. Feature is mapped to plugin/module
3. User confirms the scope
4. Component checklist is created

## Workflow

### Step 1: Receive Detected Scope

The `detect-scope` skill has already run and provided:
- `plugin`: Detected plugin name
- `module`: Detected module path
- `action`: create | modify | fix | delete | create-new-plugin
- `scope`: frontend | backend | both
- `existing_similar`: Reference implementations found in the same plugin
- `goal_condition`: User's description of what "done" looks like
- `user_confirmed`: Whether user confirmed the detected scope

**Use this information directly.** Do NOT re-detect what detect-scope already found.

### Step 2: Verify Scope (if needed)

If `user_confirmed` is true and scope is clear, skip to Step 3.

If scope needs clarification (detect-scope couldn't determine):
- Search `.agents/maps/feature-map.yaml` as fallback
- Ask minimal clarifying questions ONLY about what's missing

**DO NOT ask:**
- "Which plugin?" → already detected
- "Frontend or backend?" → already inferred
- "What action?" → already classified

### Step 3: Build Component Checklist from Detected Scope

Use the `detected_scope` to build the checklist directly. Do NOT re-derive what detect-scope already determined.

**Checklist templates based on action + scope:**

For `create` action with `both` scope (full CRUD):
```text
□ RecordTable with cursor pagination
□ Create button (opens Sheet/Dialog)
□ Edit action per row
□ Delete action with confirmation
□ Filter bar (when > 10 records)
□ Empty state with illustration
□ Loading skeleton
□ Mongoose schema in db/definitions
□ GraphQL type definitions
□ Query resolvers (list, detail)
□ Mutation resolvers (create, update, delete)
□ Permission checks
```

For `fix` action (minimal scope):
```text
□ Identify root cause
□ Fix in affected files only
□ Verify fix works
□ No regressions in related features
```

For `create-new-plugin` action:
```text
□ Scaffold frontend plugin ({plugin}_ui)
□ Scaffold backend plugin ({plugin}_api)
□ Register in manifest.yaml
□ Add Module Federation config
□ Add navigation config
□ Basic page/component structure
□ Basic entity/resolver structure
```

Use `existing_similar` as reference for component names and patterns.

### Step 4: Present Scope to User

**Format:**

```text
I'll implement this in:

📁 Plugin: {plugin_name}
📂 Module: {module_name}
🎯 Scope: {frontend/backend/both}

Frontend Components:
  • {Component1}
  • {Component2}

Backend Entities:
  • {Entity1}
  • {Entity2}

Deliverables Checklist:
  □ {Item 1}
  □ {Item 2}
  □ {Item 3}

Is this correct? (Yes / No, please specify changes)
```

**Example:**

```text
I'll implement this in:

📁 Plugin: content
📂 Module: cms/tags
🎯 Scope: Frontend + Backend

Frontend Components:
  • TagsRecordTable (list view)
  • TagForm (create/edit in Sheet)
  • TagSelector (dropdown for posts)

Backend Entities:
  • Tag (Mongoose schema)
  • Tag resolvers (CRUD)

Deliverables Checklist:
  □ RecordTable with cursor pagination
  □ Create tag form in Sheet
  □ Edit tag per row
  □ Delete tag with confirmation
  □ Tag selector for posts
  □ Real-time updates after mutations
  □ Empty state for no tags

Is this correct? (Yes / No, please specify changes)
```

### Step 5: Wait for Confirmation

**If user says "Yes" or confirms:**
- Proceed to next skill (create-page, create-table, etc.)
- Pass the confirmed scope and checklist

**If user says "No" or requests changes:**
- Update scope based on feedback
- Present revised scope
- Wait for confirmation again

**If user is unclear:**
- Ask clarifying questions
- Do not proceed until scope is clear

## Important Rules

1. **NEVER start coding before confirmation**
2. **NEVER assume scope** - always confirm
3. **ALWAYS present checklist** - prevents half-baked features
4. **ALWAYS ask about references** - "Should I model this after existing X?"
5. **If user says "I don't know"** - suggest scope based on feature-map.yaml

## Examples

### Example 1: Clear Request (detect-scope already ran)

**detect-scope provided:**
- plugin: content, module: cms/tags, action: create, scope: both
- existing_similar: categories module (CategoriesRecordTable, CategoryForm)
- goal_condition: "Tag management page + tag selector in post form"
- user_confirmed: true

**User:** "Add tags to CMS posts"

**LLM (intake):**
```text
I'll implement tags in:

📁 Plugin: content
📂 Module: cms/tags
🎯 Scope: Frontend + Backend

Frontend:
  • TagsRecordTable
  • TagForm (Sheet)
  • TagSelector (for posts)

Backend:
  • Tag schema
  • Tag resolvers

Checklist:
  □ RecordTable with cursor pagination
  □ Create/Edit/Delete
  □ Tag selector in post form
  □ Real-time updates

Is this correct?
```

**User:** "Yes"

**LLM:** Proceeds to build.

### Example 2: Vague Request (detect-scope already ran)

**detect-scope provided:**
- plugin: sales, module: pipelines, action: fix, scope: frontend
- goal_condition: "Deal pipeline board drag-and-drop not working"
- user_confirmed: true

**User:** "Fix the deals page"

**LLM (intake):**
```text
I'll fix the deal pipeline board drag-and-drop in the sales plugin. Scope: frontend only.

Checklist:
  □ Identify root cause of drag failure
  □ Fix PipelineBoard component
  □ Verify drag-and-drop between stages works
  □ Test stage transitions
  □ No regressions in related features

Is this correct? Any specific edge case you're seeing?
```

### Example 3: Ambiguous Request (detect-scope found conflict)

**detect-scope provided:**
- plugin: content, module: cms/custom-fields, action: create, scope: both
- detected_conflict: "User said 'products' but custom_fields domain is content, not sales"
- user_confirmed: false (needs clarification)

**User:** "Add custom fields to products"

**LLM (intake):**
```text
I detected custom fields for the content plugin (custom fields are managed centrally and applied to products via configuration).

📁 Plugin: content
📂 Module: cms/custom-fields
🎯 Scope: Frontend + Backend

Is this correct? Or do you want product-specific custom fields in the sales plugin?
```

## Common Mistakes to Avoid

❌ Starting to code immediately
❌ Not asking for confirmation
❌ Assuming scope without feature-map lookup
❌ Forgetting to check non-negotiable rules
❌ Not creating a component checklist
❌ Proceeding when user says "I don't know"

## Related Files

- `.agents/maps/feature-map.yaml` - Feature to plugin/module mapping
- `.agents/rules/non-negotiable.md` - Rules that MUST NOT be broken
- `.agents/manifest.yaml` - Plugin registry
