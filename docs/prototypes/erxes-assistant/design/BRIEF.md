# erxes Assistant — design brief (Lens + Companion)

Status: direction confirmed by the user on 2 November 2026. It supersedes the brief approved on 1 November 2026, which described the two-option recreation ("premium and minimal" docked chat). Scope is the top-right **erxes Assistant**, available on every page. Inspiration: the Dia browser's page-aware chat.

## 1. Feature summary

A page-aware assistant that opens from the top-right of any erxes page. It reads the page the user is on, answers with sources highlighted on that page, and runs actions directly from the answer. Audience: sales, support, and operations teammates who want help without leaving their current task.

## 2. Primary user action

Ask about what is on screen, then act on the answer in one click.

## 3. Design direction

- **Default: Lens (floating).** A compact panel floats under the Assistant button (⌘J). It doesn't take layout space. When it answers, the page dims slightly, and the rows it used get outlines and numbered pins matching the answer.
- **Pinned: Companion (docked).** "Pin to side" turns the Lens into a right-hand panel with the same conversation, draft, context, and page pins. "Float over page" returns to the Lens.
- **Typography and identity:** keep erxes's existing heading font (Inter) and the existing Assistant logo mark. Don't introduce new display fonts.
- **Visual tone:** neutral surfaces, one indigo accent for sources and selection, near-black for primary actions. No decorative gradients or mascots beyond the existing logo.

## 4. Layout strategy

Lens: header (logo, new chat, pin, close) → composer with context chips → three page-specific suggestions (empty), or an answer card below it (conversation). On phones the Lens becomes a bottom sheet. Companion: a 420px right panel; the empty state shows a page-sharing card with a switch, then suggestions; the composer sits at the bottom; on phones it fills the screen.

## 5. Key states

- Closed: the button shows the ⌘J hint.
- Empty: the current page is shared by default (removable chip/switch), with suggestions derived from the page.
- Composing: `@` adds open tabs or records; `/` opens skills; selecting text on the page offers "Ask Assistant" and quotes it.
- Loading: says what is being read ("Reading Home + 1 more…") and offers Stop.
- Answer: numbered sources; hover/focus highlights the row; click scrolls to it. Lens also pins and dims.
- Action ran: green confirmation with the result in words, plus Undo for reversible actions.
- Mode switch: draft, chips, and conversation survive Lens ⇄ Companion.

## 6. Interaction model

Actions in an answer **run directly**, without an extra confirmation step. Safety comes from three things: actions are limited to what the user's own permissions allow; the result is stated plainly; reversible actions offer Undo. Navigation actions ("Open Triage") go to the record. Enter sends, Shift+Enter adds a line, Escape closes menus before the Assistant, ⌘J toggles it.

## 7. Content requirements

Placeholder: "Ask about what you see…" (Lens) / "Ask about {page}… @ to add, / for skills" (Companion). Confirmation copy names the outcome ("Assigned 6 triages to you"). The prototype always labels answers and actions as local samples.

## 8. Recommended references

interaction-design.md (menus, focus, undo), motion-design.md (entrance only on open and new answers), responsive-design.md (bottom sheet), spatial-design.md (page annotation).

## 9. Open questions for integration

- Which actions are irreversible (e.g. sending a message) and need a different confirmation pattern despite the run-directly rule?
- Permission model: how the Assistant learns which actions the user may run on the current page.
- How live erxes exposes page structure so the answer can highlight arbitrary records (the prototype uses fixed examples).

Success criteria: Lens opens by default; pinning keeps conversation and draft; actions run and can be undone; no horizontal overflow at 375–1920px; pointer targets ≥24px and touch targets ≥44px.
