# Custom Builder Architecture

## 1. Architecture Summary

- Client editor owns transient UX state: selection, drag handles, zoom, guides, panel visibility.
- Persisted template JSON stays DB-safe and renderer-agnostic.
- Server render layer resolves dynamic bindings, expands collections, and generates final output.
- Recommended data flow: `Editor -> validate schema -> save template JSON -> inject live tour data -> map render nodes -> generate thumbnail/PDF`.

## 2. Folder Structure

```text
src/
  features/pdf-editor/
    EditorPage.tsx
    Canvas.tsx
    PageRenderer.tsx
    ElementRenderer.tsx
    InspectorPanel.tsx
    usePdfEditorStore.ts
  features/pdf-templates/
    template.types.ts
    template.schema.ts
    template.defaults.ts
    templateMapper.ts
    dataResolver.ts
  server/pdf/
    pdf.service.ts
    route-handlers.ts
    api.contracts.ts
    exampleDynamicDataResolver.ts
  app/api/pdf-templates/
    route.ts
  app/api/pdf-templates/[id]/
    route.ts
  app/api/pdf-templates/[id]/duplicate/
    route.ts
  app/api/pdf-assets/upload/
    route.ts
  app/api/pdf-templates/[id]/thumbnail/
    route.ts
  app/api/pdf/generate/
    route.ts
```

## 3. Data Models

- `PdfTemplateDocument`: single source of truth for persisted templates.
- `PdfPageDefinition`: page size, grid, margins, and background.
- `PdfTemplateElement`: strongly typed element union with stable frame data.
- `DynamicBinding`: placeholder contract between template and live data.
- `RenderNode`: flattened, PDF-ready render instruction after binding resolution.
- `PdfGenerationPayload`: immutable input for final PDF generation jobs.

## 4. Template JSON Schema

- Store one document per template version.
- Keep `pages[]`, `elements[]`, `assets[]`, `bindings[]`, and `reusableBlocks[]` separate.
- Elements reference `pageId` and `assetId` instead of embedding binaries.
- Every change should be validated against `pdfTemplateDocumentSchema` before persistence.

## 5. Editor Design

- Recommended renderer: React Konva adapter behind a page surface abstraction.
- Keep editor state normalized by page and element id.
- Only subscribe components to narrow atoms/selectors to avoid global re-renders.
- Virtualize thumbnail/page navigator when templates become multi-page and media-heavy.
- Keep drag interactions optimistic and commit to history only on interaction end.

## 6. PDF Strategy

- Recommended final PDF engine: Puppeteer for the custom builder.
- Why: closer fidelity to browser layout, easier typography parity, easier tables, easier brochure-style design.
- Keep `@react-pdf/renderer` for current fixed templates where deterministic layout matters more than design freedom.
- Tradeoff: Puppeteer is heavier and should run in server workers with queueing and resource limits.

## 7. Data Injection Engine

- Use path-based bindings such as `tour.title` and `itinerary.days[0].title`.
- Resolve bindings in a safe interpreter, never with `eval`.
- Expand list-driven elements using `dynamic-stack` and table row bindings.
- Apply formatter functions after resolution, not inside editor state.

## 8. API Design

- `POST /templates`: create blank template metadata and first version.
- `PUT /templates/:id`: validate JSON schema, persist new version or overwrite draft.
- `GET /templates/:id`: return latest editable template.
- `POST /templates/:id/duplicate`: clone template, assets references, and bindings.
- `POST /assets/upload`: issue presigned upload URL and return asset metadata shell.
- `POST /templates/:id/thumbnail`: render first page thumbnail and persist URL.
- `POST /pdf/generate`: queue or inline-generate final PDF from template + live data.

## 9. Rendering Flow

- Canvas editor model: normalized pages/elements with instant local interactions.
- Saved template model: validated JSON with only serializable values.
- Final PDF model: `RenderNode[]` after data resolution, asset lookup, and stack expansion.
- Thumbnails should reuse the same render node pipeline as PDF generation.

## 10. Performance

- Debounce autosave and thumbnail generation.
- Keep original uploads in object storage, but generate editor-friendly derivatives.
- Cache rendered PDFs by `templateId + version + data hash + locale`.
- Queue large PDF jobs and thumbnail jobs separately from request/response path.
- Lazy load page canvases and only mount pages near the viewport.

## 11. Security

- Validate file type, size, dimensions, and extension server-side before upload acceptance.
- Sanitize any imported HTML or rich text before it enters the template model.
- Restrict dynamic bindings to allowlisted root scopes.
- Enforce tenant isolation on template ids, assets, generated PDFs, and job records.

## 12. Tradeoffs & Risks

- WYSIWYG editor fidelity is expensive: browser, thumbnail, and PDF renderers must share one mapping layer.
- Collaborative editing should not be added until element identity, history, and conflict resolution are stable.
- Template marketplaces require sanitization, dependency audits, asset licensing checks, and version pinning.
