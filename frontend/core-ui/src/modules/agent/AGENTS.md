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
- a compact transcript: work-steps grouping, approval card, ask_user
  card, artifact cards, rendered HTML replies + clickable record references;
- approval cards display every supplied argument and the complete GraphQL
  variables, including nested objects, arrays, false and null. The bounded scroll
  region never truncates content or drops arguments before a human decision;
- agent turns use `AgentMessageIdentity` with the user's configured Bloub
  appearance. Only the latest response displays an avatar; earlier replies
  have none. A pending response owns the sole avatar before streaming starts,
  replacing the previous reply's icon. The current avatar follows the pointer
  at rest and uses the thinking state while working. `BotBadge`
  freezes animation for reduced-motion users. The submitted state shares this
  identity as the only visible working indicator. Activity text remains available
  to screen readers through a status region; no extra dots or visible status label
  accompany it. `agentMessageActivity` derives that status from the newest
  text/reasoning/tool part. Step groups use compact, unboxed disclosures with a
  leading chevron and an indented history rail. A pending
  response header appears only before a visible assistant row exists, including
  during the submitted-to-streaming transition and hidden answer turns.
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
- settings at `/settings/agent/*`: `connection` (BYOK), `code-mode`
  (admin-gated switch), `approvals` (admin-gated `approvalMode` radio —
  `writes` default asks before every mutation), wired through
  `settingsPath('agent')` + `SettingsWorkspacePath.Agent` +
  `GET_SETTINGS_SUB_NAVIGATION`;
- `ModelPicker` first lists connected providers plus the saved workspace default
  text action at the bottom, with no decorative default icon or provider-search
  field. Provider rows show bare brand marks and names; the saved-default shortcut is a
  single muted row. The trigger uses a quiet ghost button. The model view does
  not repeat provider marks/names on each row. Choosing a provider opens only its current/recent/saved model quick
  picks (at most four), provider-scoped search and Browse all models. Back returns
  to provider selection without changing the model. Reopening always starts with
  providers, and neither step displays a model-count badge.
  Device-local `agent:recent-models` remembers six explicit selections and is
  intersected with the live catalog, so removed models/providers cannot return
  as quick picks. Auto remains usable while model discovery loads or fails;
  provider/model ids and the empty-value server-default contract are unchanged.
- The thinking picker starts at High, and the initial outgoing request explicitly
  sends `thinkingLevel: 'high'`. Manual selections override that default for later turns.
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
- BYOK-gated composer: no configured connection shows an inline banner
  linking to the settings page and disables input.
- assistant message action row under each turn (Copy; Regenerate on the
  last assistant message only and not while streaming → `retryLastTurn`;
  timestamp when `createdAt` exists) — hover/focus-revealed, always
  visible on the last assistant message; the old `w-7` copy gutter is
  gone so transcripts use full width.
- export: `AgentThreadActionsMenu` → `utils/exportThreadMarkdown.ts`
  (`## You` / `## AI Agent`, text parts only, `[Page context]` stripped,
  `metadata.agentsAnswer` turns skipped, tokens→labels outside code,
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
  (`agentsFiles.ts` limits, `uploadAgentsFile.ts`), chips in the composer,
  image previews and download chips in history (`AttachedFiles`).
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
   `data-agent-chart` is the sole admitted chart attribute. `whatIfChartModel.ts`
   validates bounded JSON and evaluates postfix arithmetic without eval/Function.
   `WhatIfChart` portals trusted erxes-ui numeric inputs, reset and accessible
   baseline/scenario SVG bars into valid containers. Inputs change local scenario
   state only; invalid specifications fail visibly. Generated scripts stay blocked;
   downloaded HTML retains the model's baseline fallback, not interactive controls.
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
  outside collapsed work steps. `parseArtifacts.ts` only decodes old fences for
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

`utils/pageContext.ts` strips persisted `[Page context]` from user bubbles.
`references/getPageRecordFromLocation.ts` supplies the next send's page context.

## Work steps

`utils/agentWorkSteps.ts` folds contiguous reasoning + tool parts of an
assistant message into compact `AgentWorkSteps` disclosures ("N steps");
`step-start` parts are transparent, approvals/ask_user stay standalone. `agentStepLabel` derives the per-row label
(`callGraphql` shows its operation/field name,
`execute_typescript` → "Ran code", `readFile` → "Read <name>").

`utils/transcriptRows.ts` merges consecutive assistant messages separated only
by hidden turns into one transcript row. Adjacent work-step groups combine;
the action row renders only when the turn has text or is the last assistant
turn. A single-step card names the action.

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
- Clickable references require native tool evidence; canonical metadata and
  registered routes own their labels/targets. Never repair or invent ids.

## Validation

- `pnpm nx test core-ui` — tests in `__tests__` + `artifacts/__tests__`.
- `pnpm nx build core-ui` — rspack.
- eslint on touched files — 0 errors expected.

## Chat motion

- Assistant opening/closing eases its outer width and opacity for 180ms while
  retaining the mounted chat, stream and draft. Hidden content is inert.
  Resizing changes the inner panel directly without animating drag width.
- Session tabs enter/exit and shift position over 160ms. Removal still waits
  for successful deletion; failed deletion keeps the session.
- New conversation surfaces and user/assistant arrivals use short fades with a
  6px rise. Stream deltas do not restart row animation. All motion respects
  the system reduced-motion preference; send-button feedback has no bounce.
