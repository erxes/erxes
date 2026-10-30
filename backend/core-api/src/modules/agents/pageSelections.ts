import { z } from 'zod';

export const AGENTS_PAGE_SELECTIONS_DATA_TYPE = 'data-agents-page-selections';
export const AGENTS_PAGE_SELECTION_MAX_PER_TURN = 3;

/** Selection context is a domain value. Its snapshot is storage-backed media,
 * not a user-uploaded file or generated deliverable. Keep this wire schema in
 * sync with the other side of the agents REST boundary. */
export const agentsPageSelectionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(80),
  path: z
    .string()
    .max(200)
    .regex(/^\/[^?#]*$/)
    .refine((path) =>
      Array.from(path).every(
        (character) =>
          character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127,
      ),
    ),
  frame: z.string().trim().min(1).max(80).optional(),
  text: z.string().max(8_000),
  width: z.number().int().positive().max(100_000),
  height: z.number().int().positive().max(100_000),
  snapshot: z.object({
    url: z.string().min(1).max(2048),
    type: z.literal('image/png'),
    size: z
      .number()
      .int()
      .positive()
      .max(2 * 1024 * 1024),
  }),
});
export type IAgentPageSelectionContext = z.infer<typeof agentsPageSelectionSchema>;

export const agentsPageSelectionsSchema = z
  .array(agentsPageSelectionSchema)
  .min(1)
  .max(AGENTS_PAGE_SELECTION_MAX_PER_TURN)
  .refine(
    (items) => new Set(items.map((item) => item.id)).size === items.length,
    'Duplicate selection.',
  )
  .refine(
    (items) =>
      new Set(items.map((item) => item.snapshot.url)).size === items.length,
    'Duplicate snapshot.',
  );

export class AgentsPageSelectionError extends Error {
  readonly statusCode = 400;
}
const recordSchema = z.record(z.unknown());
export const collectAgentsPageSelections = (
  parts: unknown[],
): IAgentPageSelectionContext[] => {
  const selections: IAgentPageSelectionContext[] = [];
  for (const value of parts) {
    const part = recordSchema.safeParse(value);
    if (!part.success || part.data.type !== AGENTS_PAGE_SELECTIONS_DATA_TYPE)
      continue;
    const parsed = z
      .object({ selections: agentsPageSelectionsSchema })
      .safeParse(part.data.data);
    if (!parsed.success)
      throw new AgentsPageSelectionError(
        'Invalid page selection. Select the element again.',
      );
    selections.push(...parsed.data.selections);
  }
  if (
    selections.length &&
    !agentsPageSelectionsSchema.safeParse(selections).success
  )
    throw new AgentsPageSelectionError(
      'Too many or duplicate page selections.',
    );
  return selections;
};

const legacyEntrySchema = z.array(
  z.object({ name: z.string(), mimeType: z.string(), content: z.string() }),
);
const legacyContextSchema = z.object({
  kind: z.literal('User-selected page content'),
  title: z.string(),
  path: z.string(),
  frame: z.string().optional(),
  viewport: z.object({ width: z.number(), height: z.number() }),
  visibleText: z.string(),
});
const legacyFilesSchema = z.object({
  type: z.literal('data-agents-files'),
  data: z
    .object({
      files: z.array(
        z.object({
          name: z.string(),
          url: z.string(),
          type: z.string(),
          size: z.number(),
        }),
      ),
      displayText: z.string(),
      textFileUrls: z.array(z.string()).optional(),
    })
    .passthrough(),
});

/** Read compatibility for the original PNG+TXT format. No filename alone is
 * enough: recover only the exact pair and validated context written by v1. */
export const migrateLegacyPageSelections = (parts: unknown[]): unknown[] => {
  if (
    parts.some(
      (part) =>
        recordSchema.safeParse(part).data?.type ===
        AGENTS_PAGE_SELECTIONS_DATA_TYPE,
    )
  )
    return parts;
  const text = parts
    .flatMap((value) => {
      const part = z
        .object({ type: z.literal('text'), text: z.string() })
        .safeParse(value);
      return part.success ? [part.data.text] : [];
    })
    .join('\n');
  const raw = text
    .split('The following JSON contains complete UTF-8 file contents:\n')[1]
    ?.split('\n')[0];
  if (!raw) return parts;
  let entries: z.infer<typeof legacyEntrySchema>;
  try {
    const result = legacyEntrySchema.safeParse(JSON.parse(raw));
    if (!result.success) return parts;
    entries = result.data;
  } catch {
    return parts;
  }
  const recovered: IAgentPageSelectionContext[] = [];
  let displayText = '';
  const rewritten = parts.flatMap((part) => {
    const parsed = legacyFilesSchema.safeParse(part);
    if (!parsed.success) return [part];
    const moved = new Set<string>();
    for (const entry of entries) {
      const match = /^page-selection-([0-9a-f-]{36})\.txt$/i.exec(entry.name);
      if (!match || entry.mimeType !== 'text/plain') continue;
      const contextFile = parsed.data.data.files.find(
        (file) => file.name === entry.name && file.type === 'text/plain',
      );
      const snapshot = parsed.data.data.files.find(
        (file) =>
          file.name === `page-selection-${match[1]}.png` &&
          file.type === 'image/png',
      );
      if (!contextFile || !snapshot) continue;
      try {
        const context = legacyContextSchema.parse(JSON.parse(entry.content));
        const selection = agentsPageSelectionSchema.parse({
          id: match[1],
          title: context.title,
          path: context.path,
          frame: context.frame,
          text: context.visibleText,
          width: context.viewport.width,
          height: context.viewport.height,
          snapshot: {
            url: snapshot.url,
            type: 'image/png',
            size: snapshot.size,
          },
        });
        recovered.push(selection);
        moved.add(contextFile.url);
        moved.add(snapshot.url);
      } catch {
        /* Unrelated/invalid legacy attachments keep normal file semantics. */
      }
    }
    if (!moved.size) return [part];
    displayText = parsed.data.data.displayText;
    const files = parsed.data.data.files.filter((file) => !moved.has(file.url));
    return files.length
      ? [
          {
            ...parsed.data,
            data: {
              ...parsed.data.data,
              files,
              textFileUrls: parsed.data.data.textFileUrls?.filter(
                (url) => !moved.has(url),
              ),
            },
          },
        ]
      : [];
  });
  if (
    !recovered.length ||
    !agentsPageSelectionsSchema.safeParse(recovered).success
  )
    return parts;
  return [
    ...rewritten,
    {
      type: AGENTS_PAGE_SELECTIONS_DATA_TYPE,
      data: { selections: recovered, displayText },
    },
  ];
};
