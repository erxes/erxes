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

### Step 1: Analyze User Request

Parse what the user is asking for:
- Feature name or description
- Action type (create, fix, update, delete, improve)
- Target entity (posts, deals, tasks, etc.)

### Step 2: Map to Known Feature

Search `.agents/maps/feature-map.yaml` for matching features:

```bash
# Search by keywords
grep -i "keyword" .agents/maps/feature-map.yaml

# Example: User says "I need tags"
grep -i "tag" .agents/maps/feature-map.yaml
```

**If exact match found:**
- Use the mapping from feature-map.yaml
- Identify plugin, module, components

**If no match found:**
- Ask user: "Which plugin does this belong to? (content, sales, operation, frontline, payment, etc.)"
- Ask user: "Is this frontend, backend, or both?"
- Use user's answers to determine scope

### Step 3: Determine Scope

Based on user request type, determine what needs to be built:

| User Says | Likely Scope |
|-----------|-------------|
| "Add/create new X" | Frontend + Backend (full CRUD) |
| "Fix X" | Minimal (wherever bug is) |
| "X looks bad/broken" | Frontend only |
| "X is slow" | Backend only |
| "Add X to existing Y" | Depends on X and Y |
| "Update/improve X" | Frontend + Backend |

**Auto-detect logic:**
- If user mentions UI elements (page, table, form, button) → Include frontend
- If user mentions data/schema/model → Include backend
- If user says "new feature" or "add" → Usually both
- If user says "fix" → Minimal scope

### Step 4: Build Component Checklist

Based on the feature type from feature-map.yaml templates, create a checklist:

```
For "list_feature" type:
□ RecordTable with cursor pagination
□ Create button (opens Sheet/Dialog)
□ Edit action per row
□ Delete action with confirmation
□ Filter bar
□ Empty state
□ Loading skeleton

For "form_feature" type:
□ Form component with React Hook Form
□ Zod validation
□ All required fields
□ Submit/Cancel buttons
□ Success/error toast

For "detail_feature" type:
□ Detail view component
□ Breadcrumb navigation
□ Action buttons
□ Related data sections
```

### Step 5: Present Scope to User

**Format:**

```
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

```
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

### Step 6: Wait for Confirmation

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

### Example 1: Clear Request

**User:** "Add tags to CMS posts"

**LLM:**
```
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
  □ RecordTable
  □ Create/Edit/Delete
  □ Tag selector in post form
  □ Real-time updates

Is this correct?
```

**User:** "Yes"

**LLM:** Proceeds to build.

### Example 2: Vague Request

**User:** "Fix the deals page"

**LLM:**
```
I need more information:

1. Which plugin? (sales_ui)
2. What's broken? (UI, data loading, performance?)
3. Is this frontend only or backend too?

Please describe the issue.
```

### Example 3: Wrong Scope Detected

**User:** "Add custom fields to products"

**LLM:**
```
I'll implement custom fields in:

📁 Plugin: content (custom fields are in content plugin)
📂 Module: cms/custom-fields
🎯 Scope: Frontend + Backend

Note: Custom fields are typically managed in the content plugin 
and applied to products via configuration.

Is this correct? Or do you want product-specific custom fields 
in the sales plugin?
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
