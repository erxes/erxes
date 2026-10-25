# Agent module — AI chat UI (core-ui)

The `agent` module is the core-ui surface for the core-api `agents` backend
(ported from the former private `erxes-agent` plugin UI). It provides:

- Assistant chat lives only in the shared side panel. There is no standalone
  chat or capabilities page. `LegacyAgentRedirect` replaces old `/agent/*`
  bookmarks with `/?panel=/chat`; an old thread id is forwarded through
  `agentSidePanelThreadRequestState`. Settings stay at `/settings/agent/*`;
- the top-bar `AssistantButton` (`CoreTab`) opens the shared `?panel=/chat`
  route and owns the permission-gated `mod+j` shortcut and unread indicator.
  There is no floating agent tray. The button and shortcut are unavailable
  without `agentsChat`;
- `side-panel/components/chat/AssistantPanel.tsx` lazy-loads our
  `AgentSidePanel` chat content through `SidePanelChat` inside the public
  `RecordSidePanel` shell. It is a full-height flex column beside the main
  workspace, outside page animation: opening it shrinks the page, and it
  shares the record panel's persisted width and resize handle. Assistant can
  resize from 320px up to 1,200px, leaving 320px for the workspace when space
  permits; record panels retain their 600px maximum. The left-edge grip also
  supports arrow keys (Shift for larger steps) and Home/End for width limits.
  Pointer capture and a temporary viewport shield keep resize events out of HTML
  frames. Drag paints are batched per animation frame; persisted width changes
  only on release/cancel. Entrance animation never transitions drag width. Lost capture, missing primary button, blur, Escape and
  unmount all clean up the drag.
  The shared panel displays either a record or Assistant. After first open,
  the chat stays mounted but hidden while closed or showing a record, keeping
  drafts, streams and activity alive. The header uses browser-style session tabs,
  thread actions, Settings (keeps the panel open) and Close. `ChatInput`
  retains one visible line and remeasures when the
  hidden panel is shown or resized;
- `ThreadTabs`: stable session order, truncated titles, horizontal scrolling with
  edge buttons, active-tab reveal on selection/resize, native Tabs keyboard
  navigation and Delete to close. Plus opens a blank conversation; an empty tab
  remains usable after closing the last session. Existing saved sessions load in
  pages through the same `useAgentsThreads` subscription. Closing a tab deletes
  its session with one click, selects the neighboring tab only if it was active,
  and clears that session's reconnect pointers. Pending closes cannot duplicate
  mutations; failed deletes retain the tab. Rename, pin and export remain in the
  current-session actions menu; the old history popup and delete dialog are gone.
  Shared mutations live in `hooks/useAgentsThreadActions.ts` with immediate
  refetch and error feedback.
- a transcript with one activity timeline per assistant turn (see "Turn
  activity timeline"), approval card, ask_user card, artifact cards, rendered
  HTML replies + clickable record references;
- approval cards display every supplied argument and the complete GraphQL
  variables, including nested objects, arrays, false and null. The bounded scroll
  region never truncates content or drops arguments before a human decision;
- agent turns use `AgentMessageIdentity` with the user's configured Bloub
  appearance. Only the latest response displays an avatar; earlier replies
  have none. A pending response owns the sole avatar before streaming starts,
  replacing the previous reply's icon. The current avatar follows the pointer
  at rest and uses the thinking state while working. `BotBadge`
  freezes animation for reduced-motion users. The submitted state shares this
  identity as the only working indicator until the turn has timeline work; then
  the turn's activity header shows the same label visibly. The identity's
  sr-only status region is the only live region: `agentTurnActivity` derives it
  from the newest text/reasoning/tool part, and the header adds no second one.
  A pending response header appears only before a visible assistant row exists,
  including during the submitted-to-streaming transition and hidden answer turns.
  Transcript entry/send motion respects reduced motion; file previews retain their full available width;
- user turns have Copy and inline Edit actions (`components/UserMessage.tsx`).
  Save & resend uses the SDK's `messageId` replacement and sends
  `editMessageId` to rewind persisted history at that exact user turn. It
  retains attachments and original page context, restores the transcript on
  HTTP rejection, and is disabled during active/suspended/reconnectable runs.
  Later replies are replaced; previously executed workspace actions remain;
- `AskUserPrompt` presents one question at a time with full-width choices,
  custom text, progress navigation and retained drafts. Multi-question groups
  have a review/edit step before explicit submission; answers keep the existing
  positional string/string-array contract. `AskUserAnswered` is the persisted
  summary in the transcript;
- settings at `/settings/agent/*`: `connection` (BYOK; each saved connection
  shows a `Default` badge or a `Set as default` action →
  `AgentsConnectionSetDefault`, toasts, awaited `AgentsConnections` refetch;
  tests in `pages/settings/agent/__tests__`), `code-mode`
  (admin-gated switch), `approvals` (admin-gated `approvalMode` radio —
  `writes` default asks before every mutation), wired through
  `settingsPath('agent')` + `SettingsWorkspacePath.Agent` +
  `GET_SETTINGS_SUB_NAVIGATION`;
- `ModelPicker` first lists connected providers plus the saved workspace default
  text action at the bottom, with no decorative default icon or provider-search
  field. Provider rows show bare brand marks and names; the saved-default shortcut is a
  single muted row naming the provider and model it runs. The trigger uses a
  quiet ghost button whose title names provider and model. The model view does
  not repeat provider marks/names on each row (compact 13px rows). Choosing a
  provider immediately shows `Recent` (current/recent picks outside the
  recommended set, at most three) and `Recommended` (the backend's
  `catalog[].recommended` shortlist), provider-scoped search and Browse all
  models. Search and Browse group the usable catalog into `Recommended` /
  `Others` in backend rank order; `Show less` returns to the shortlist. Only
  the connection the backend marks `isDefault` (what the empty value runs, per
  `pickConnection`; the first saved entry when no entry is flagged) is marked
  `Default` and its provider `In use`, and the trigger/`Use saved default` row
  name it; other connections' stored models are not defaults. A provider whose listing failed
  shows its key-free `error`, an `Unavailable` provider marker when not in use,
  and its saved model as the only choice. Loading, empty and no-match states
  are explicit. Back returns to provider selection without changing the model.
  Reopening always starts with providers, and neither step displays a
  model-count badge.
  Device-local `agent:recent-models` remembers six explicit selections and is
  intersected with the live catalog, so removed models/providers cannot return
  as quick picks. Auto remains usable while model discovery loads or fails;
  provider/model ids and the empty-value server-default contract are unchanged.
  `useAgentsModels` normalizes `agentsModels` into ranked
  `{ id, family, recommended }` options per provider (falling back to the flat
  `models` ids). Saving or removing a connection in settings refetches the
  active `AgentsModels` query.
- The thinking picker starts at High, and the initial outgoing request explicitly
  sends `thinkingLevel: 'high'`. Manual selections override that default for later turns.
  The trigger is a compact ghost button with an intensity mark and the level name
  only; the menu lists each level with a one-line description. `thinkingLevel` values
  stay `off`, `minimal`, `low`, `medium` and `high`.
- `PageElementPicker` is the composer's Select on page mode. Trusted capture-phase
  listeners inspect the app and accessible same-origin frames, including sandboxed
  HTML reports. Selection clicks cannot activate the underlying controls. Escape
  cancels; arrows choose parent/child elements. Visible bounds follow scrolling
  ancestors and frame offsets. Cross-origin embedded content remains isolated.
  `utils/pageSelection.ts` uses lazily loaded `modern-screenshot` with restored
  scroll positions, crops to visible bounds, and excludes password/private/hidden
  content. No DOM markup or input values are extracted as text.
  `pageSelections.ts` defines the `data-agents-page-selections` context contract:
  stable id, title, source path/frame, visible text/bounds, and a storage-backed PNG
  snapshot. There is no generated text file or ordinary file attachment for a
  selection. Up to three selections are separate from the five uploaded-file slots.
  The backend validates context and reads snapshot bytes as model media; typed
  data persists in Mastra memory. `PageSelectionContext` renders a reference card
  without download controls. History restore, reconnect and edits retain it.
  Existing PNG/TXT selections are normalized on backend history reads using their
  validated stored context; filenames alone never change attachment semantics.
  Thread changes/unmount abort uploads, cancel picking and release object URLs.
  Composer controls use container queries at narrow panel widths.
- Composer @ mentions: `AgentMentionInput` layers mentions over the plain
  `ChatInput` textarea (no BlockNote). Typing `@` at a word boundary opens a
  caret-anchored erxes-ui `Popover` with `SuggestionMenu`/`SuggestionMenuItem`,
  following `MentionInEditor`'s item layout, placeholder rows and status note,
  grouped by record type with `AGENT_REFERENCE_TARGETS` icons. Arrow keys,
  Enter/Tab and Escape stay in the textarea (popup imperative handle); Enter
  never sends while results load. `AgentMentionPopup` (search + menu) is
  lazy-loaded on the first `@`. Sources (`hooks/useAgentMentionSearch.ts`):
  ui-modules `useUsers` (empty query lists team members only), `useCustomers`,
  local `AgentsMentionCompanies` (ui-modules keeps its companies hook private),
  and plugin records only through published `searchProviders`
  (`sales-deals` → deal, `frontline-conversations` → conversation) via core-ui
  search's document builder. Each source requires the target's module
  permission. Visible text keeps `@Label`; a pointer-transparent mirror paints
  pills and locates the caret. Backspace/Delete remove a mention as one unit;
  other edits inside one turn it into plain text. At most 10 distinct records
  per message. `utils/mentionText.ts` owns ranges/tokens; `useAgentMentions`
  binds ranges to one exact text value, so resets drop them automatically.
- BYOK-gated composer: no configured connection shows an inline banner
  linking to the settings page and disables input.
- assistant message action row under each turn (Copy — the turn's answer
  text only, never narration; Regenerate on the
  last assistant message only and not while streaming → `retryLastTurn`;
  timestamp when `createdAt` exists) — hover/focus-revealed, always
  visible on the last assistant message; the old `w-7` copy gutter is
  gone so transcripts use full width.
- export: `AgentThreadActionsMenu` → `utils/exportThreadMarkdown.ts`
  (`## You` / `## AI Agent`; consecutive assistant messages separated only by
  skipped user turns export once, as `agentTurnAnswerText` — no narration,
  reasoning or tools; `[Page context]` stripped,
  `metadata.agentsAnswer` turns skipped, tokens→labels outside code (the
  user's own mentions export as `@Label`),
  Blob download `slugified-title.md` / `conversation-<date>.md`).
- empty state (`ChatPanel`): compact centered greeting, composer and stacked
  suggestions from `constants/agentSuggestions.ts` (plugin-gated prompts
  hidden via `pluginsConfigState`). There is no full-page layout variant.

## Surfaces and contracts

- REST goes through the gateway at `${REACT_APP_API_URL}/pl:core/agents/*`
  (`api.ts`) — `/pl:core` because the root core proxy idles out after 60s
  and would kill SSE. `transport.ts` (`AgentsChatTransport`) filters
  approval/reconnect chunks, sends `credentials: 'include'`, reads
  `X-Agents-Thread-Id`, persists active runs per thread for reconnect,
  and reroutes approval/answer sends to `/agents/approve` and
  `/agents/answer`. `approvalDecisions.ts` resumes the answered Mastra gate even
  when later calls in the same model step remain input-available. Those calls
  cannot execute until resume, so the SDK's all-tool-completed predicate would
  deadlock. Decisions carry their exact `toolCallId`; outstanding approval cards
  still require explicit answers, and older steps never authorize another send.
- GraphQL documents in `graphql/` — `Agents*` prefixed operation names,
  consumed verbatim from the backend schema; `AgentsThreadsChanged` is a
  refetch signal only.
- `hooks/useAgentsChat.ts` wraps the AI SDK `useChat` with durable-run
  semantics: `openThread` (history restore + active-run reconnect +
  bounded re-read), `startNewConversation`, `submitAnswer` (ask_user
  resume), `sendMessage`, `retryLastTurn` (`regenerate`),
  `setPageContext`. The selected-thread namespace defaults to `panel`;
  active runs remain keyed by thread. Switching sessions awaits SDK stream
  detachment before clearing the shared transcript, preserves the previous run id,
  and reattaches through the backend when that thread is reopened. Detachment is
  not a backend cancellation command. The hook owns a native SDK `Chat` and passes
  it to `useChat`, preserving `resumeStreamIsReplay`. The transport captures the
  actual SDK-assigned pending user id before dispatch. History restore matches that
  id and removes only the active response suffix before replay; it never appends
  a synthetic turn based on prompt equality. Legacy prompt-only sessions strip
  the hidden page-context prefix during migration. Manual reconnect uses the same
  restore/replay path. Approval/question suspensions keep their stored cards.
  The legacy `page` storage namespace is
  retained in the hook's type only for compatibility, with no page UI.
- Attachments: up to 5 files/turn via platform `/upload-file`
  (`agentsFiles.ts` limits/accepted types, `uploadAgentsFile.ts`). The picker,
  panel-wide drop and paste all call the composer's `attachFiles`, which uses
  `planAgentsAttachments` (`utils/agentAttachments.ts`): unsupported types and
  files past the limit are toasted and never become chips; empty, oversized and
  text-budget failures are error chips without Retry; failed uploads keep the
  source `File` and offer Retry. Non-GIF images over 2 MiB are re-encoded in the
  browser to JPEG ≤2 MiB (`utils/resizeAgentsImage.ts`), because the backend
  shares only ≤2 MiB images as model media and not every provider takes WebP.
- Drop: `AgentFileDropZone` wraps the whole side panel (tabs header + `ChatPanel`)
  and reaches the composer through `IComposerAttachHandle` (`attachRef`, set with
  `useImperativeHandle`). `useAgentFileDrop` counts dragenter/dragleave depth
  (`utils/fileDrag.ts`) so nested children never flicker. It accepts only
  external `Files` drags: drags that start in this document (links, images, text)
  are ignored. It always cancels file dragover so a drop never navigates the tab,
  and resets on window drop/dragend/blur. Disabled/streaming composers show no
  overlay and refuse the drop (`dropEffect: none`); a full composer shows a limit
  state. The pointer-events-none overlay fades and scales over 200ms, with no
  transition for reduced motion.
- Paste reaches the composer through `AgentMentionInput` → `ChatInput`
  `onPaste`; text pastes stay ordinary edits for mention ranges.
- Paste: `filesFromClipboard` attaches screenshots, Finder copies and browser
  image copies; a generic `image.png` becomes `pasted-image-<timestamp>.png`.
  Rich text copies (`text/plain` + `text/html`, such as Excel cells) stay text.
  Pasting files while streaming is refused with a toast.
- `AgentAttachmentCard` is the one attachment card for composer and history:
  thumbnail or type icon, name, `kind · size`, spinner, error, Retry/Remove; in
  history the card opens the stored file. Composer chips enter with
  `.agent-chip-enter` (`src/styles.css`, reduced-motion gated). `AttachedFiles`
  renders images first (one at `w-64`, several as square tiles), then document
  cards. Files-only turns hide the `Uploaded files` placeholder prompt in the
  bubble and Copy (`withoutFileOnlyText`); Edit starts from an empty draft.
- Replies: `MessageContent` renders every assistant text segment through
  `HtmlPreview`; `replyHtml.ts` converts legacy Markdown/prose into HTML.
  HTML previews preserve isolated layout CSS and SVG. `htmlTheme.ts` uses native
  CSSOM to normalize generated text/surface/border colors to renderer-owned
  tokens, including inline `!important`, nested rules and legacy attributes.
  Generated overrides of those tokens and opacity/filter text effects are
  removed. SVG series retain their paints; text labels follow the theme.
  Root/body surfaces are transparent. `HtmlPreview` syncs host tokens on content
  updates and app theme changes without regenerating/reloading the frame. They
  grow to content height and update the existing frame while streaming.
  `htmlSandbox.ts` sanitizes content and enforces a restrictive CSP; the frame
   permits same-origin for trusted parent sizing/portals but never model scripts.
   Its base stylesheet is marked `data-agent-renderer` (sanitized markup cannot
   carry that attribute) and is exempt from theme normalization; it styles
   headings, lists, captions and tables (uppercase muted headers, tabular
   numbers, row hover). `htmlTheme.ts` right-aligns body columns after the first
   whose non-empty cells are all figures (`.agent-num`; skips colspan/rowspan).
   Host `primary-foreground`, `success` and `destructive` tokens are synced too.
   `data-agent-chart` is the sole admitted chart attribute. `whatIfChartModel.ts`
   validates bounded JSON and evaluates postfix arithmetic without eval/Function.
   Optional, backwards-compatible display hints per input/output: `format`
   (`number|currency|percent`), `currency` (ISO 4217), `decimals` (0–6),
   `description` (≤160); outputs may set `better` (`higher|lower`). Legacy
   `unit` still works: `%` → percent, 3-letter codes/₮€£$ → currency.
   `whatIfFormat.ts` owns locale formatting/parsing, deltas and tones.
   Host Tailwind/erxes-ui CSS does not exist inside the frame, so erxes-ui
   controls render unstyled there. `HtmlPreview` therefore portals `WhatIfChart`
   into an open shadow root on each chart container; the widget ships its own
   scoped stylesheet (`whatIfChartStyles.ts`) using the synced tokens, isolated
   from model CSS and the theme policy. The card has a header/badge/collapsible
   assumption, slider + locale numeric field per input with baseline tick and
   delta chip, reset (disabled at baseline), KPI tiles with animated values,
   per-metric or shared-scale grouped bars, a table toggle and a debounced live
   region. Motion respects `prefers-reduced-motion`. Inputs change local scenario
   state only; invalid specifications fail visibly (`.agent-chart-error`).
   Generated scripts stay blocked; downloaded HTML retains the model's baseline
   fallback, not interactive controls. Avoid `@container` in renderer CSS: jsdom
   cannot parse it, so tests use media queries (the frame viewport is the report width).
  `htmlReferences.ts` replaces valid text tokens with real `AgentReferenceChip`
  portals, retaining permission-aware navigation; attributes, code, anchors,
  styles and SVG never produce reference controls. User messages, approvals,
  questions and editing keep their normal components.
- Artifacts: only `createArtifact` tool parts produce file cards. Its versioned
  `{ kind: 'artifact', version: 1, artifact: { type, title, filename, content } }`
  result persists through the existing tool-message storage/history mapping.
  `artifactResult.ts` validates results before `ArtifactToolResult` renders
  `ArtifactCard` with source/download controls. Tool inputs never create a file
  card; pending calls use the turn header's progress and show an interruption
  notice after streaming stops. Invalid/failed results show an error. These tool parts stay
  outside the collapsed activity timeline. `parseArtifacts.ts` only decodes old fences for
  readable reply display; no text fence, title or marker grants file controls.
  DOCX/PDF conversion failures offer Retry.

## References

`referenceRegistry.ts` derives per-message evidence only from successful native
`callGraphql`, `findPages`, or `execute_typescript` manifests in that message or
preceding history. Prose, user content, tool inputs, artifact content and nested
sandbox results never authorize links. Unknown handles show “Reference unavailable”;
unverified legacy tokens remain plain text. Scoped registries survive native
Mastra history mapping. HTML replies and plain-text renderers bind opaque handles
only in text nodes; code and attributes never become controls. Copy/export use
canonical labels outside code. Model-authored workspace anchors remain plain text.

`AgentReferenceChip` uses the registry's type/id/name. Record clicks call the
fixed `/agents/references/resolve` endpoint and navigate only after the current
record identity and location validate. Missing/deleted/denied records never
navigate. Deals require verified board/pipeline metadata, without fallback routes.
Pages require exact membership in the current navigation catalog. Registered
route builders own destinations and preserve the Assistant panel. Async resolution
cannot navigate after the chip unmounts or changes identity.

User mentions (`agentMentions.ts`): wire text carries one `[[type:id:label]]`
token per mention plus a `data-agents-mentions` part `{ mentions }` derived
from those tokens (send, edit and in-flight restore all derive it from text).
The backend verifies each record as the user and stores
`{ mentions, displayText }`; `mapStoredMessages` prefers that display text and
keeps a leading `[Page context]` line. `AgentMentionScope` adds only the
message's own mention part to that bubble's registry, so its tokens render as
`AgentReferenceChip`s (navigation still resolves first). Editing restores
`@Label` ranges and resends tokens alongside the turn's attachments; Copy and
export use `@Label`. The composer placeholder hints `Ask anything, @ to mention`.

`utils/pageContext.ts` strips persisted `[Page context]` from user bubbles.
`references/getPageRecordFromLocation.ts` supplies the next send's page context.

## Turn activity timeline

One prompt's whole run is one process instance. `utils/agentTurnTimeline.ts`
(pure, `import type` only) splits a transcript row's parts:

- `classifyAgentTurnText`: non-empty text followed by more work (reasoning or
  a non-standalone tool; text, `step-start` and data parts are transparent) is
  **narration**; text before a standalone card (approval, ask_user, artifact)
  or after the last work is the **answer**. Narration that is the first text,
  before any tool call, is the visible **intro**. While streaming, trailing
  text is provisionally the answer and becomes narration as soon as another
  work part arrives. A settled turn without answer text promotes its last
  narration so nothing collapses to empty. Settled empty reasoning is ignored;
  streaming reasoning counts as work.
- `buildAgentTurnLayout`: timeline `sections` (narration title + following
  steps; work before the first narration forms an untitled lead section), the
  `body` (intro, answer and every non-work part in original order), counts,
  `activeIndex` and `answerText` (copy/export).
- `agentTurnActivity`: running tool label (`agentMessageActivity`), latest
  `**title**` of reasoning summaries or "Thinking…", "Writing…" for text, or
  the newest narration's last sentence between steps.

`AgentTurnActivity` renders one collapsed-by-default header per turn when it
has timeline content (plain answers get none). Live: shimmering label that
crossfades in place. Settled: "Worked for 42s · N steps" when `MessageList`
timed the run (fresh send, or continuation of a timed turn after approval or
answer; reattached runs are never timed), else "N steps", a single tool's
label, or "Thought". Expanded: thin-rail timeline; narration titles render via
`TextWithAgentReferences`, tools via `AgentStepRow` (`agentStepLabel`:
`callGraphql` operation/field names, "Ran code", "Read <file>"), reasoning via
`AgentThinkingBlock` (muted, expandable, shimmer while it is the live part).
Approvals, ask_user and artifact cards are never folded.

`utils/agentWorkSteps.ts` owns the part predicates (`isWorkPart`,
`isStandalonePart`, `toAgentWorkStep`) and step labels.

`utils/transcriptRows.ts` merges consecutive assistant messages separated only
by hidden turns into one transcript row, so a resumed run continues the same
timeline. The action row renders only when the turn has answer text or is the
last assistant turn.

## State

- `states/agentPanelStates.ts` — `agentSidePanelThreadRequestState`
  (one-shot, plain `atom`) for old thread bookmarks. Panel open state
  is the shared `panel` URL query, and width uses `sidePanelWidthState` from
  `ui-modules`; old independent agent panel/tray state is no longer consumed.
- `states/agentActivityState.ts` — unread/working/awaiting activity from
  `useAgentActivity`, displayed by the top-bar Assistant button.
- sessionStorage: `agents-selected-thread:<scope>`,
  `agents-active-run:<threadId>`, `agents-in-flight-prompt:<threadId>`.
  Model and thinking selections live in memory only.

## Invariants

- Keep the transcript and panel flex children shrinkable (`min-w-0` /
  `min-h-0`). The scroll viewport's direct content wrapper must use block
  layout: Radix's default table layout lets long step labels widen the chat.
- erxes-ui / ui-modules components only; no direct `@radix-ui`, no
  `console.log`, no `any`, named exports.
- `ai` is ESM-only — pure util/test files must keep `import type`
  only (see `utils/agentWorkSteps.ts` local predicates) or jest (CJS)
  breaks.
- Permission gates mirror the backend: rail/panel need `agentsChat`,
  thread list needs `showAgents`, settings toggle needs
  `manageAgentsSettings`.
- Clickable references require native tool evidence, or — in the user's own
  bubble only — the server-verified mention part of that message; canonical
  metadata and registered routes own their labels/targets. Never repair or
  invent ids.
- Mention tokens must round-trip: labels follow the backend's sanitization
  (no brackets/newlines, ≤80 chars) and `page` is never mentionable.

## Validation

- `pnpm nx test core-ui` — tests in `__tests__` + `artifacts/__tests__`.
  `approvalRoundTrip.test.ts` resolves its fixture from the repository root, so
  run it with jest from the root when the Nx run reports a resolve error.
- `pnpm nx build core-ui` — rspack.
- eslint on touched files — 0 errors expected.

## Chat motion

- Assistant opening/closing eases its outer width and opacity for 180ms while
  retaining the mounted chat, stream and draft. Hidden content is inert.
  Resizing changes the inner panel directly without animating drag width.
- Session tabs enter/exit and shift position over 160ms. Removal still waits
  for successful deletion; failed deletion keeps the session.
- New conversation surfaces and user/assistant arrivals use short fades with a
  6px rise. The activity header label slides/fades in place over 220ms
  (`agent-activity-enter/exit` in `styles.css`) and the expanded timeline fades
  in; shimmer is `motion-safe` only. Stream deltas do not restart row animation. All motion respects
  the system reduced-motion preference; send-button feedback has no bounce.
