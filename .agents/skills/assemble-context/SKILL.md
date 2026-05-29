---
name: assemble-context
description: Auto-assemble the complete working context for any task by loading relevant rules, skills, and plugin configurations. This is a meta-skill that all other skills depend on.
---

# Skill: Assemble Context

## Purpose

Before any agent starts work in this repository, it must assemble the correct context. This skill ensures that:

1. All relevant rules are loaded
2. The working plugin is identified
3. Applicable skill contracts are available
4. No rule is missed or forgotten

## When to Use

**ALWAYS** use this skill first, before any other skill or task.

## Workflow

### Step 1: Identify the Working Context

Determine:
- Which file(s) will be touched
- Which plugin is involved (if any)
- What type of work (frontend, backend, shared, docs)

### Step 2: Load Rule Layers

Using the manifest's `rule_layers`, load all applicable layers in precedence order:

1. **Constitution** (always): `AGENTS.md`
2. **Global Rules** (always): `.agents/rules/*.md`
3. **Category Rules** (if applicable):
   - Frontend work: `frontend/plugins/AGENTS.md`
   - Backend work: `backend/plugins/AGENTS.md`
4. **Plugin-Specific Rules** (if applicable): `{plugin_path}/AGENTS.md`

### Step 3: Load Skill Contract (if using a skill)

If the task matches a skill from the manifest:
1. Read `.agents/skills/{skill-name}/contract.yaml`
2. Read `.agents/skills/{skill-name}/SKILL.md`

### Step 4: Resolve Conflicts

If rules conflict:
- Higher precedence wins
- More specific scope wins
- When ambiguous, ASK

### Step 5: Verify Readiness

Before proceeding, confirm:
- [ ] Constitution loaded
- [ ] All applicable rule layers loaded
- [ ] Skill contract loaded (if applicable)
- [ ] Plugin identified (if applicable)
- [ ] No conflicting rules unresolved

## Example

**Task**: "Add a new table page to the sales plugin"

**Context Assembly**:
1. Load `AGENTS.md`
2. Load all `.agents/rules/*.md`
3. Load `frontend/plugins/AGENTS.md` (frontend category)
4. Load `frontend/plugins/sales_ui/AGENTS.md` (if exists)
5. Load `.agents/skills/create-table/contract.yaml`
6. Load `.agents/skills/create-table/SKILL.md`

**Result**: Complete working context with all rules, plugin conventions, and skill workflow.

## Important

- Never skip context assembly
- Never assume you know the rules without loading them
- Plugin-specific rules override global rules
- When a plugin has no AGENTS.md, fall back to category rules
