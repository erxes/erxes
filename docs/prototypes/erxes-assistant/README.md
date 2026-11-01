<img src="assets/icon.svg" width="64" height="64" alt="">

# erxes UX & UI

Created in [T3 Code](https://t3.codes).

## erxes Assistant prototype

Open [design/chat-concept.html](design/chat-concept.html) directly in your browser. No server or build step is required.

The Assistant opens by default as a floating **Lens** under the top-right button (⌘J). It reads the current page, answers with numbered sources pinned on the page, and runs actions directly from the answer, with Undo. **Pin to side** turns it into the docked **Companion**, keeping the conversation and draft. `@` adds open tabs or records, `/` opens skills, and selecting text on the page offers “Ask Assistant”. Inspired by Dia's page-aware browser chat; it uses erxes's existing Inter font and Assistant logo.

Everything is local: answers are samples, actions only change the demo page, and no erxes data is read or changed. Refreshing resets the demo.

- [Design brief](design/BRIEF.md)
- [Design findings (earlier review)](design/REVIEW.md)
- [Approved brief](design/BRIEF.md)
- [Design system](DESIGN.md)
- [Interaction and responsive test](tests/chat.test.mjs)

## Validation

Run these commands from `docs/prototypes/erxes-assistant`:

```sh
pnpm install --ignore-workspace
pnpm exec playwright install chromium
pnpm test
```

If Chromium is already installed elsewhere, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its executable path. Tests open the HTML directly from disk. They cover the Lens default, mentions, skills, page pins, direct actions with Undo, and pinning into the Companion. They also check for overflow and 24px pointer targets at 375, 768, 1280, and 1920px, and 44px touch targets on a phone.

This standalone prototype does not integrate with production erxes source or backend.
