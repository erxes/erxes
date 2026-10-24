# Credits

## Code we started from
- **erxes plugin generator** (`pnpm create-plugin`) — github.com/erxes/erxes. Generated the plugin skeleton and wiring files (`connectionResolvers.ts`, `apollo/*`, `StudymateMain.tsx`, `config.tsx`), which we edited. See the erxes repository `LICENSE`.

## APIs (code written to match their public documentation)
- **Gemini API** — ai.google.dev/api (`generateContent`, `streamGenerateContent` with SSE, `inline_data`).
- **Ollama API** — github.com/ollama/ollama (`/api/chat`).

## Model
- **Gemma 4** by Google — used under the Gemma Terms of Use (ai.google.dev/gemma/terms).

## Libraries (already part of erxes)
React, Apollo Client, Mongoose, Tabler Icons (`@tabler/icons-react`), erxes-ui, erxes-api-shared, ui-modules.

## Techniques
Fisher–Yates shuffle (quiz answers), spaced repetition (study reviews), background job + polling pattern.

## Tools
Development assisted by Claude (Anthropic).
