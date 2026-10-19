# Agent module — AI chat UI (core-ui)

The `agent` module is the core-ui surface for the core-api `agents` backend
(ported from the former private `erxes-agent` plugin UI). It provides:

- the full-page chat at `/agent` and `/agent/:threadId`
  (`pages/agent/AgentIndexPage.tsx`, permission-guarded `module="agents"`)
  plus `/agent/capabilities` (`pages/agent/AgentCapabilitiesPage.tsx`,
  routed before `:threadId` — the GraphQL operation catalog from `agentsTools`).
  Capabilities opens on a plugin overview (up to six plugins, total tool counts,
  read/write counts) with monochrome plugin icons using theme tokens.
  Selecting a plugin opens a 20-tool paginated browser with
  search and read/write/approval filters. Operation signatures and inputs appear
  only after opening a tool; zero-input tools also have usable details;
- chat width presets standard/wide/full (`utils/chatWidth.ts`, persisted
  `agentChatWidthState`, header `DropdownMenu` radio); collapsible thread
  sidebar (`agentThreadsSidebarOpenState`); page header: sidebar/drawer
  toggle, `AI Agent` › thread-title breadcrumb, `AgentThreadActionsMenu`,
  Capabilities / width / Settings buttons, primary `New conversation`;
- the global `AgentSidePanel` docked right inside `AppWorkspace`
  (`modules/app/components/MainLayout.tsx`), beside the new `CoreAppOutlet`;
  the relation side panel remains a full-height sibling of the main content
  column, so opening agent chat does not replace the record panel;
  the floating `AgentTray` mounts outside the animated page — resizable 360–720px
  (persisted), Sheet on mobile, never rendered on `/agent*` so only one
  chat instance exists per thread; `AgentTrayMount` also unmounts the tray
  while the side panel is open, stopping its bot effects and animation engine.
  The lightweight mount owns the permission-gated `mod+j` shortcut so it
  remains available while the tray is unmounted;
- the `NavigationAgentButton` rail entry (after `NavigationInboxButton`,
  `mod+j` hotkey, hidden without the `agentsChat` action);
- thread history (`ThreadList`): client-side filter, Pinned group first
  (`IconPin`), then Today / Yesterday / Previous 7 days / Older, "load
  more" pagination, hover `IconDots` menu (inline rename — Enter saves,
  Esc/blur cancels; pin/unpin; delete via AlertDialog), live refresh via
  `agentsThreadsChanged`; shared mutations live in
  `hooks/useAgentsThreadActions.ts` (rename/setPinned/remove + toasts,
  refetches `AgentsThreads` + `AgentsPinnedThreads`);
- a Twenty-style transcript: work-steps grouping, approval card, ask_user
  card, artifact cards, markdown + clickable record references;
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
- empty state (`ChatPanel` `variant`): 'page' = greeting by time of day +
  `currentUser` first name, left-aligned `max-w-4xl`, large composer
  (`Composer size="large"` → `ChatInput minHeight`), Kbd hint, "Try
  asking" card grid from `constants/agentSuggestions.ts` (plugin-gated
  prompts hidden via `pluginsConfigState`), capabilities link; 'panel' =
  compact centered variant.

## Surfaces and contracts

- REST goes through the gateway at `${REACT_APP_API_URL}/pl:core/agents/*`
  (`api.ts`) — `/pl:core` because the root core proxy idles out after 60s
  and would kill SSE. `transport.ts` (`AgentsChatTransport`) filters
  approval/reconnect chunks, sends `credentials: 'include'`, reads
  `X-Agents-Thread-Id`, persists active runs per thread for reconnect,
  and reroutes approval/answer sends to `/agents/approve` and
  `/agents/answer`.
- GraphQL documents in `graphql/` — `Agents*` prefixed operation names,
  consumed verbatim from the backend schema; `AgentsThreadsChanged` is a
  refetch signal only.
- `hooks/useAgentsChat.ts` wraps the AI SDK `useChat` with durable-run
  semantics: `openThread` (history restore + active-run reconnect +
  bounded re-read), `startNewConversation`, `submitAnswer` (ask_user
  resume), `sendMessage`, `retryLastTurn` (`regenerate`),
  `setPageContext`. `sessionScope` (`page`/`panel`) separates each
  surface's selected-thread restore; active runs are shared per thread.
- Attachments: up to 5 files/turn via platform `/upload-file`
  (`agentsFiles.ts` limits, `uploadAgentsFile.ts`), chips in the composer,
  image previews and download chips in history (`AttachedFiles`).
- Artifacts: `artifacts/` splits tagged `html`/`xlsx`/`docx`/`pdf` fences
  and renders previews/downloads (`MessageContent` → `Markdown`). HTML previews
  sanitize an HTML-only fragment, strip document-level styles/scripts, and
  run in a script-disabled iframe. DOCX import/render failures show the
  download fallback.

## References

`references/parseAgentReferences.ts` parses `[[<type>:<id>:<label>]]`
tokens the model copies from `callGraphql` `references` — unknown type,
malformed id (`[A-Za-z0-9_-]{1,64}`), bracket/newline in label, or an
unclosed mid-stream token stays literal text.
`references/agentReferenceTargets.ts` maps the ten types to record pages
(same paths as `CORE_RESULT_PATHS`), icons, permission modules, and
plugin availability (`sales_ui`/`frontline_ui` in `pluginsConfigState`).
`AgentReferenceChip` renders chips inside assistant text (markdown
`p/li/td/th/h1–h6/strong/em/blockquote` only — never code/pre/a or
artifacts); unresolvable targets render as plain pills. A click inside
`/agent` navigates AND opens the side panel on the same thread
(`agentSidePanelThreadRequestState`).
`utils/pageContext.ts` strips a persisted leading `[Page context] …`
text part from user bubbles; it is not rendered in the transcript.
`references/getPageRecordFromLocation.ts` is the reverse lookup powering
the side-panel composer: `{ path: pathname, record? }` rides the next
normal send's `pageContext` (dismissible chip hides `record` only).

## Work steps

`utils/agentWorkSteps.ts` folds contiguous reasoning + tool parts of an
assistant message into `AgentWorkSteps` ("N steps", shimmering while
streaming); `step-start` parts are transparent, approvals/ask_user stay
standalone. `agentStepLabel` derives the per-row label
(`callGraphql` shows its operation/field name,
`execute_typescript` → "Ran code", `readFile` → "Read <name>").

`utils/transcriptRows.ts` merges consecutive assistant messages separated only
by hidden turns into one transcript row. Adjacent work-step groups combine;
the action row renders only when the turn has text or is the last assistant
turn. A single-step card names the action.

## State

- `states/agentPanelStates.ts` — `agentSidePanelOpenState`,
  `agentSidePanelWidthState`, `agentChatWidthState`,
  `agentThreadsSidebarOpenState` (localStorage via `atomWithStorage`),
  `agentSidePanelThreadRequestState` (one-shot, plain `atom`), and
  `agentSidePanelResizingState` (transient drag state owned by the agent).
- `states/agentChatContext.ts` — `AgentChatThreadContext` (current
  transcript thread id for chips).
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
- Never render a `[[token]]` the model produced differently — chips copy
  the raw token; parsing never repairs or invents ids.

## Validation

- `pnpm nx test core-ui` — tests in `__tests__` + `artifacts/__tests__`.
- `pnpm nx build core-ui` — rspack.
- eslint on touched files — 0 errors expected.
