# @erxes/assistant-catalog

The A2UI catalog of the in-product assistant: the components and functions the model may write
between `<a2ui>` and `</a2ui>` in a reply, and the panel draws. A2UI is Google's agent-to-UI
protocol (`@a2ui/web_core`, `@a2ui/react`, `@a2ui/agent`), here at protocol 1.0.

- `src/components.ts` has erxes' own components (Stat, Badge, Table, Chart, MemberPicker).
  `src/index.ts` adds the ones kept from A2UI's basic catalog and builds the catalog with
  `assistantCatalog`. A description here is prompt text: the model reads it.
- This package is the only place that imports zod 3, which A2UI needs; the rest of the repo is on
  zod 4. `src/react.ts` re-exports `@a2ui/react` so the renderer resolves zod 3 too. Import A2UI's
  React parts from `@erxes/assistant-catalog/react`, never from `@a2ui/react`.
- `catalog.json` is generated: `pnpm --filter @erxes/assistant-catalog generate`, checked by
  `pnpm check:generated`. The API reads only this file (`apps/api/src/modules/assistant/ui.ts`),
  so its bundle carries no zod 3.
- The web app draws each component with erxes-ui in `apps/web/src/modules/assistant/ui/components`
  and lists them in `apps/web/src/modules/assistant/ui/catalog.ts`. A component added here needs
  its drawing there, in the same change.
- Bound values reach a component as the model wrote them. Narrow them with the readers in
  `apps/web/src/modules/assistant/ui/components/values.ts` before use.
