# .agents/ROUTER.md — THE single entry point for building in erxes

> You were given a user request like **"I want ..."**. This file is your script.
> **Read it top to bottom and DO each step in order. Do not jump ahead. Do not
> start coding until STEP 5 says you may.** Every step tells you the exact
> command to run and the exact decision to make. When a step says STOP, stop.
>
> You do NOT need to read any other file to start. This file pulls in what you
> need, when you need it. Ignore `manifest.yaml`'s longer protocol — it is
> reference material; THIS file is the procedure.

If you are an experienced agent: this still applies to you. The value is the
deterministic location lookup in STEP 2 and the confirmation gate in STEP 5.

---

## The whole flow in one picture

```text
"I want ..."
  STEP 1  Classify the action ........... create | fix | change | new-plugin
  STEP 2  Resolve WHERE (grep the map) ... plugin + module + frontend/backend
  STEP 3  Open the reference file ........ a REAL file to copy, not invent
  STEP 4  Ask 1–3 INTENT questions ....... about the OUTCOME, never "which plugin"
  STEP 5  Show scope block, WAIT for "yes"  ← the only gate. No coding before this.
  STEP 6  Load ONLY the rules you need ... tiered by scope, not all 14
  STEP 7  Build by copying the reference . + run the matching skill
  STEP 8  Self-check ..................... machine-checkable list, then PR loop
```

---

## STEP 0 — Load the always-on rules (takes 1 minute)

Read these three files **in full**. They are short and they are non-negotiable
for every task:

```bash
cat .agents/rules/non-negotiable.md
cat .agents/rules/architecture.md
cat .agents/rules/code-style.md
```

You are responsible for every MUST/NEVER in `non-negotiable.md`. The most common
ones a model breaks: no `default` exports, no `any`, no half-built CRUD, no
cross-plugin imports, named GraphQL operations only. Keep them in mind the whole
time.

---

## STEP 1 — Classify the action

Read the user's words and pick ONE action. This decides everything downstream.

| The user is saying… | action | typical scope |
|---|---|---|
| "I want / add / create / build / new X" | `create` | usually `both` |
| "X is broken / wrong / not working / slow / looks bad" | `fix` | minimal — where the bug is |
| "change / update / improve / rename / move X" | `change` | follows the thing changed |
| "build a whole new plugin / product area for X" | `new-plugin` | full scaffold |

Write down: `action = <one of the four>`. If you genuinely cannot tell create
vs change, treat it as `change` (it is the safer superset).

---

## STEP 2 — Resolve WHERE this lives (the accuracy step — do not guess)

You will NOT ask the user "which plugin?". You will look it up.

1. Pull the **main nouns** out of the request (the things, not the verbs).
   Example: "I want customers to see their loyalty points" → nouns:
   `customers`, `loyalty points`.

2. Grep the feature map for each noun:

```bash
grep -in "loyalty\|points\|customer" .agents/maps/feature-map.yaml
```

3. Decide from the matches:

   - **Exactly one entry matches** → that entry is your location. Read its
     `plugin`, `scope`, `frontend`, `backend`, and any `reference_*` lines.
     Write down the scope block (see STEP 5). Go to STEP 3.

   - **Zero entries match** → do NOT invent a plugin. Jump to STEP 4 and ask the
     `disambiguation.unknown` question from the map. After the answer, grep
     again with the new nouns.

   - **Two or more entries match** (e.g. "customer" hits contacts + insurance +
     inbox) → open the `disambiguation:` section of the map, find the matching
     block, and ask its `ask:` question in STEP 4. The answer's `entry:` is your
     location. **This is still an intent question, not a plugin question** — you
     are asking what they want to happen, and the map turns that into a plugin.

   - **The match is a `ui_patterns` anchor (its id starts with `_`)** → it gives
     you a reference file + skill but NOT a `plugin`/`scope`. The location is
     still unknown: ask which existing feature or screen this attaches to (an
     outcome question), grep that noun, and resolve a real entry **before** you
     fill the STEP 5 scope block.

4. Note the `scope` value:
   - `frontend` → you will only touch `frontend/plugins/<x>_ui` or `core-ui`.
   - `backend` → only `backend/plugins/<x>_api` or `core-api`.
   - `both` → frontend + backend (most "I want a new feature" requests).
   - `core` → it lives in `core-api` / `core-ui` and is shared by ALL plugins.
     **Editing core is high-impact. Say so in STEP 5 and get explicit confirm.**

> Rule of thumb the map encodes for you: a brand-new custom field on an existing
> thing is usually `properties` (core), NOT a new schema field in the plugin.
> Trust the map's `note:` lines.

---

## STEP 3 — Open the reference file (copy, don't invent)

The matched entry names a real file in `reference_table` / `reference_board` /
`reference_detail` / `reference_entity_def` / `reference_create`, or you can use
the generic anchors under `ui_patterns:` in the map.

**Open it and read it fully:**

```bash
cat <the reference path from the map>
# also list its siblings to learn the folder shape:
ls <the module path from the map>
```

You will COPY this file's structure (imports, exports, hooks, naming) for the new
code. erxes is highly patterned — the right answer almost always looks like the
nearest existing sibling. If the entry has no reference, use the `ui_patterns`
anchor that matches what you're building (table / form / detail).

If you cannot find any sibling pattern in the target plugin, run:

```bash
.agents/scripts/assemble-context.sh <module path> <skill-name>
```

---

## STEP 4 — Ask 1–3 INTENT questions (the clarification mechanism)

You now know WHERE. You do NOT yet know exactly WHAT "done" means. Ask the user —
but **only about the outcome**, and **at most 3 questions**.

**NEVER ask:** which plugin, frontend or backend, which module, what components,
what file names. You already resolved those in STEP 2. Asking them is a failure.

**DO ask** (pick the template for your action; skip a question if the request
already answered it):

`action = create`
1. "Who uses this and what should they be able to *do* with it?"
2. "What does *done* look like — a list page, a form to add/edit, a board, a
   widget on another screen, or several of these?"
3. "Full create + edit + delete, or read-only for now?"

`action = fix`
1. "What exactly happens now, and what *should* happen instead?"
2. "Give me one concrete example — a record, a click, or a value — where it goes
   wrong."

`action = change`
1. "After the change, what's different for the user compared to today?"
2. "Should everything that works today keep working unchanged (existing data,
   existing screens)?"

`action = new-plugin`
1. "What is the ONE core thing users will manage in this plugin?"
2. "Is *done* basic create/list/edit/delete, or a specific workflow beyond CRUD?"

If STEP 2 returned **2+ matches**, your FIRST question is the map's
`disambiguation` `ask:` — framed as outcome, with its options. Then continue
with the action template above if needed.

For Claude Code: ask these with the **AskUserQuestion** tool (one call, up to the
allowed options). For other tools: ask in plain text and wait. **Do not proceed
without answers.**

---

## STEP 5 — Show the scope block and WAIT for confirmation (THE GATE)

This is the only gate. Build NOTHING before the user confirms. Print exactly:

```text
Here's what I'm about to build:

  Action:    <create | fix | change | new-plugin>
  Plugin:    <plugin name from the map>      (impact: <plugin-local | CORE = all plugins>)
  Module:    <module path>
  Scope:     <frontend | backend | both | core>
  Done when: <one line restating the user's confirmed outcome>
  Pattern:   I'll copy <reference file from STEP 3>
  Touches:   <bullet list — e.g. RecordTable, create Sheet, Mongoose entity, GraphQL ops, translations>

Build this? (yes / tell me what to change)
```

- User says **yes / correct / go** → STEP 6.
- User changes something → update the block, print it again, wait again.
- User is unsure → ask ONE more intent question, then re-print. Never start
  coding on an unconfirmed scope.

> There is no JSON state file and no preflight script in this flow. The printed
> block + the user's "yes" IS the gate. (Legacy `detect-scope`/`intake` skills
> and `preflight-check.sh` describe an older mechanism — you do not need them;
> this step replaces them.)

---

## STEP 6 — Load ONLY the rules this scope needs (tiered)

Do not read all 14 rule files. Read STEP 0's three, plus the rows below that
match your scope. This keeps your context focused.

| If your scope/touch includes… | also read |
|---|---|
| any TypeScript at all | `.agents/rules/typescript-guidelines.md` |
| frontend (UI, React) | `react-general-guidelines.md`, `react-state-management.md`, `file-structure.md` |
| user-visible text/labels | `translations.md` |
| backend (API, resolvers, models) | `file-structure.md` (architecture.md is already always-on from STEP 0) |
| a DB migration / data backfill | `server-migrations.md` |
| running builds/tests/nx | `nx-rules.md` |
| writing or touching tests | `testing-guidelines.md` |
| `.github/workflows/*` | `github-actions-security.md` |
| a brand-new plugin | read the `create-plugin` skill |
| editing files under `.agents/` | `feedback-incorporation.md` |

Then load the **skill** for what you're building (read its `SKILL.md` and
`contract.yaml`):

| You are building… | skill |
|---|---|
| a list/table screen | `create-table` |
| a page + route | `create-page` |
| a create/edit form (sheet/drawer/dialog) | `create-form-drawer` |
| a popup/dialog/modal | `create-modal` |
| a GraphQL query/mutation + hook | `create-query` |
| a Mongoose entity/model | `create-backend-entity` |
| a data migration/backfill | `create-backend-migration` |
| a React provider/context | `create-provider-context` |
| translation keys | `add-translations` |
| a Module Federation expose | `module-federation-expose` |
| nav / settings entry | `configure-plugin-navigation` |
| a whole new plugin | `create-plugin` |
| fixing lint/TS/Sonar | `fix-sonar` |

```bash
cat .agents/skills/<skill>/SKILL.md
cat .agents/skills/<skill>/contract.yaml
```

A `both`-scope feature usually chains several skills (e.g. create-backend-entity
→ create-query → create-table → create-form-drawer). The contract's
`composes_with:` lists the chain.

---

## STEP 7 — Build by copying the reference

1. Make the smallest change that satisfies the confirmed scope. Copy the STEP 3
   reference's structure; match naming, exports, and folder layout of its
   siblings.
2. Backend GraphQL ops MUST be named + plugin-prefixed (`salesDealList`, not
   `list`). Named exports only. No `any`. No `default` exports in app code.
3. If you scaffolded anything (`create-plugin`), the generated code VIOLATES the
   rules on purpose — you MUST fix every default export, `any`, placeholder, and
   `schemaWrapper` before moving on.
4. Keep each commit small and one-purpose. Don't refactor unrelated files.

---

## STEP 8 — Self-check before you call it done

Run the validations for what you touched:

```bash
# frontend plugin
pnpm nx lint <plugin>_ui && pnpm nx build <plugin>_ui
# backend plugin
pnpm nx build erxes-api-shared && pnpm nx build <plugin>_api
# rules compliance on the files you changed
.agents/scripts/check-rules.sh <path you edited>
```

Then walk this list — every box must be true:

- [ ] Scope matches the STEP 5 block the user confirmed (no scope creep).
- [ ] No `default` export in app code; named exports only.
- [ ] No `any`; types are real.
- [ ] CRUD is complete if you started it (list has create+edit+delete, buttons
      have handlers) — no half-features.
- [ ] No cross-plugin imports; no new UI system; reused existing components.
- [ ] GraphQL ops are named + plugin-prefixed.
- [ ] User-visible strings go through `t('...')` and exist in `locales/en.json`.
- [ ] Lint + build pass.

If you opened a PR, you are NOT done until the **pr-review-loop** skill settles
(all AI-reviewer comments addressed, CI green):

```bash
cat .agents/skills/pr-review-loop/SKILL.md
```

---

## Hard stops (halt and ask the user)

- The map returns 0 matches AND the `unknown` question didn't clarify it.
- The change requires editing **core** (`core-api`/`core-ui`) and the user only
  expected a plugin change.
- A scaffold or build error you can't fix in 2 attempts.
- The confirmed scope turns out to need a cross-plugin contract change.

When you halt: say exactly what's blocking and what you tried. Don't guess, don't
fabricate success, don't invent a PR URL.

---

## One-line summary for the model

**Classify → grep the map for WHERE → open the reference → ask only about the
OUTCOME → get a "yes" on the scope block → load just the rules you need → copy
the reference → self-check.** Never ask which plugin; never code before the yes.
