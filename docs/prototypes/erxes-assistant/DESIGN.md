# Design System — erxes Assistant

## Product Context
- **What this is:** A standalone, interactive prototype of the top-right erxes Assistant: a floating Lens by default that can be pinned as a docked Companion. It demonstrates the design without connecting to production data.
- **Who it is for:** Sales, support, and operations teammates.
- **Project type:** Workspace app UI.
- **Scope:** Chat and surrounding reference context only.

## Aesthetic Direction
- **Direction:** Page-aware Lens with a pinnable Companion (confirmed 2 Nov 2026), inspired by Dia's browser chat.
- **Decoration:** Minimal. Page annotations (dimming, outlines, numbered pins) are the only expressive element.
- **Mood:** Precise, composed, helpful.
- **Reference:** The user’s two erxes screenshots and a scoped authenticated review of the live assistant, its menus, and mobile presentation.

## Typography
- **All text:** Inter 400–700, the font erxes uses today. The user asked to keep the existing heading font and logo; the earlier Manrope/Source Sans 3 pairing is retired.
- **Scale:** 11.5–12.5px metadata; 13–14px controls; 14.5px chat body (line-height 1.65); 20px empty-state heading; 24px page heading.
- **Loading:** Google Fonts with display=swap; system sans-serif fallback keeps the file usable offline.

## Color
- **Foreground:** #18181B; secondary #3F3F46; muted #71717A; faint #A1A1AA.
- **Surfaces:** #FFFFFF; soft #F4F4F5; border #E4E4E7.
- **Accent (sources, selection, pins):** #4F46E5 on #EEF0FF; accent text #3730A3.
- **Primary actions and send:** near-black #18181B.
- **Action confirmation:** #166534 on #ECFDF3, always with words.

## Spacing and Layout
- **Base unit:** 4px.
- **Lens:** 440px floating panel, 12px below the top bar, 16px from the right; bottom sheet under 760px.
- **Companion:** 420px docked panel; full screen under 760px.
- **Radii:** 5–8px controls and chips; 12px cards; 16–18px composer and Lens surfaces.
- **Hit targets:** ≥24px for pointer (WCAG 2.2 AA 2.5.8); all Assistant controls grow to ≥44px on touch (`pointer: coarse`).

## Motion
- **Entrance:** 220ms drop-in only when the Lens opens or a new answer arrives; pins pop in once, 60ms apart. Re-renders (actions, chips) never replay animation.
- **Loading:** shimmer on the status line, with Stop.
- **Reduced motion:** all animation and transitions disabled.

## Decisions Log
| Date | Decision | Rationale |
|---|---|---|
| 2026-11-02 | Lens default, pin to Companion | User chose the creative floating Lens as default, with one click to the docked Companion. |
| 2026-11-02 | Actions run directly from answers | User confirmed; prototype states each result and offers Undo where reversible. |
| 2026-11-02 | Keep Inter and the existing logo | User asked to keep current heading and logo fonts; Manrope/Source Sans 3 retired. |
| 2026-11-01 | Premium/minimal direction confirmed | User selected stronger typography and less visible chrome. |
| 2026-11-01 | Brief approved | User confirmed right docking, history menu, three starter prompts, grouped settings, mobile layout, and key states. |
| 2026-11-01 | Preserve live page context and reasoning levels | Authenticated review confirmed Select on page and five reasoning levels; local demo now reflects both. |
| 2026-11-01 | Single-file prototype | Repository contains no application source or backend contract; a local HTML artifact is reviewable and portable. |

No production integration, model availability, or access-control claims are implied by the prototype.
