# erxes workspace chat — design review

Target: https://officenext.erxes.io/ · 1 November 2026

Scope: the top-right chat launcher and docked assistant panel. Evidence: the two supplied screenshots plus authenticated desktop/mobile captures and control inspection. Sign-in and two-factor verification completed successfully. This is an app UI, so density, orientation, and task completion take priority over decoration.

## First impression

The panel communicates a capable general-purpose assistant, but its hierarchy does not yet communicate a workspace tool. My eye goes to the conversation tabs, the black assistant mark, then the model selector. The question field should win that competition. In one word: dispersed.

## Findings and specific improvements

All six observations below refer to [the original chat screenshot](../../design/screenshots/original-chat.png). The [closed workspace screenshot](../../design/screenshots/original-workspace.png) establishes the surrounding product context. These are design findings; the live inspection confirms the controls and dimensions noted below. They are not claims of functional failure.

| ID | Impact | Observation | Concrete improvement |
|---|---|---|---|
| 01 | High | Several truncated conversation titles and close icons share a thin top strip. Active conversation identity is weak. | Give the panel a stable “erxes assistant” header. Put the current title beneath it and previous conversations in a searchable history menu. Retain a clearly labelled New chat action. |
| 02 | Medium | Roughly 240px of empty space sits between the tab strip and assistant mark at the supplied desktop size. The composer begins around halfway down the panel. | Start the introductory content 64–80px below the header. Left-align heading, supporting text, and composer on one content rail. Keep the composer at the bottom once a conversation begins. |
| 03 | Medium | Model name, reasoning level, attachment, context selection, and send have similar visual weight. “High” is ambiguous without its menu. | Keep attach and send directly available. Combine model and reasoning into a labelled settings control. Show the currently selected model quietly below the question field. |
| 04 | Medium | Six identical full-width suggestion rows require reading every line. There is no clear starting recommendation. | Show three task-led rows: customers added this week, open deals, and unanswered conversations. Label their domain and provide More ideas for the remaining prompts. Clicking should populate a draft, allowing review before sending. |
| 05 | Medium | The tiny chat launcher is recognizable mainly after learning its icon. | Add “AI chat” beside the icon when space permits, a tooltip at compact widths, and an unmistakable active state. Keep a 44px hit area. |
| 06 | Polish | Large radii and a composer shadow carry much of the visual hierarchy; the heading is only modestly stronger than prompt text. | Use a restrained 4/8/12/16px radius hierarchy, a 28px introductory heading, 16px body text, and a stronger composer border/focus treatment. Reserve violet for selected and primary actions. |

## Quick wins

1. Move the introductory group higher and align it with the composer.
2. Change “Ask anything, @ to mention” to a visible “Your question” label, a concrete placeholder, and separate keyboard/mention help.
3. Clarify “High” as “Reasoning: High” inside settings.
4. Reduce the initial suggestion list to three, preserving access to the others.
5. Label the chat launcher and ensure keyboard-visible focus.

## Authenticated live validation

The live assistant was opened from the top-right **Assistant** button at `/?panel=%2Fchat`. No questions were submitted, no attachments were sent, and no provider or reasoning options were selected.

- **Panel:** measured 400px wide at a 1440px viewport in this browser session. It exposes a resize separator; the screenshot’s wider panel is a supported presentation, not a fixed dimension to assume.
- **Small-screen presentation:** at 375px, the panel measured 320px and left a 55px sliver of the workspace visible. Some starter text was truncated. The recreation gives chat the full width at this size.
- **Control sizes:** attachment, page selection, and send were 32×32px; New chat and Close were 28×28px; starter rows were 38px high. These fall below this redesign’s 44px target, which is a usability goal rather than a blanket claim of WCAG AA failure.
- **Page context:** Select on page activates a selector with click-to-attach, parent/child navigation, and Escape to cancel. The recreation now preserves this entry point and provides a removable section context chip. Its local section picker is an approximation, not the live arbitrary-element selector.
- **Reasoning:** verified Off, Minimal, Low, Medium, High. The recreation now uses these exact levels, with plain-language descriptions.
- **Model selection:** the live control opens a provider-aware chooser with Kimi Code and OpenAI entries and a saved-default action. The initially displayed Kimi K2.8 Preview label resolved to the saved `kimi-for-coding` model during loading. The prototype keeps clearly labelled example choices; provider setup and availability require integration.
- **Accessibility metadata:** the live composer is named Message; controls have accessible names, and the session strip is a tablist. The feedback about visual discoverability does not imply those names are missing.
- **Typography:** the inspected panel uses Inter. The approved recreation uses Manrope and Source Sans 3 for a more distinct hierarchy.

Evidence: [desktop chat](../../design/screenshots/live-chat-desktop.png), [mobile chat](../../design/screenshots/live-chat-mobile.png), [page context selection](../../design/screenshots/live-context-selection.png).

## Limits of the live review

Message generation, permission enforcement, upload behavior, actual response latency, screen reader announcements, and provider configuration were not exercised. No production-wide accessibility compliance or performance score is claimed. No production functional bug was confirmed.

## Approved direction

The user selected **premium and minimal**, with stronger typography and less visible chrome, and approved the brief. The recreation keeps light surfaces and a single erxes violet accent. Its functional character is precise, composed, and helpful. Stronger typography and alignment replace decorative labels and crowded controls. Conversation history is accessible through the current-title menu.

Safe choices: right-hand docking, familiar composer behavior, preserved workspace context. Deliberate departures: history replaces crowded tabs; a compact left-aligned introduction replaces the centered chatbot landing screen. Benefits are readable navigation and a faster visual path to asking a question. Costs are an extra click to change chats and less decorative brand presence.

## Implementation and verification

- Screenshot audit: complete.
- Live authentication and scoped chat inspection: complete, including desktop, mobile, model chooser, reasoning menu, and page-selection mode.
- Source integration: production source is unavailable. The repository initially contained only a README and icon.
- Recreation: implemented in [chat-concept.html](../../design/chat-concept.html), with approved design rules in [DESIGN.md](../../DESIGN.md).
- Findings 01–06: addressed in the standalone recreation, not deployed to erxes.
- Responsive verification: browser measurements found no horizontal overflow at 375, 768, 1280, or 1920px. Every visible chat button met 44px width and height minimums at these sizes.
- Interactions: editable suggestions, draft preservation on close/reopen and conversation switching, Enter/Shift+Enter, sample responses, simulated errors and retry, cancellation, attachment removal, page-context preservation and submission, history search, exact reasoning choices, and theme switching pass the automated browser flow.
- Runtime: no uncaught page errors during the tested flow; no duplicate DOM IDs.
- Visual review: inspected the four viewport captures plus settings, response, and dark mode.

The test found duplicate SVG/control IDs and an undersized mobile New chat control. Both were corrected before the passing run. Dark-theme inspection also caught an unnecessary text-color transition that briefly reduced legibility; text now switches immediately.

### Evidence

- [Mobile, 375px](../../design/screenshots/recreated-375.png)
- [Tablet, 768px](../../design/screenshots/recreated-768.png)
- [Desktop, 1280px](../../design/screenshots/recreated-1280.png)
- [Wide, 1920px](../../design/screenshots/recreated-1920.png)
- [Settings](../../design/screenshots/settings.png), [sample response](../../design/screenshots/response.png), [dark theme](../../design/screenshots/dark.png)
- [Automated interaction check](../../tests/chat.test.mjs)

### Remaining limitations

The prototype does not query workspace data, upload attachments, resolve mentions, call models, or persist conversations after a refresh. Those need the production frontend and backend contracts. Mobile checks use desktop Chromium at narrow widths, not real-device keyboard tests. Font delivery depends on Google Fonts, with a local fallback.

No production-wide design, accessibility, or performance grade is claimed from this scoped review. The production states listed under authenticated validation were inspected; message generation and other untested states remain outside this review. The visual improvements and local interactions listed above have direct evidence.


Status: **DONE_WITH_CONCERNS** — approved recreation and scoped live review complete. Production source and backend integration remain outside this prototype's scope.
