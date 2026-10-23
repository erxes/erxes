import type { UIMessage } from 'ai';
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

export const pageSelectionsPart = (
  selections: IAgentPageSelectionContext[],
): UIMessage['parts'][number] => ({
  type: AGENTS_PAGE_SELECTIONS_DATA_TYPE,
  data: { selections },
});
export const readPageSelectionsPart = (
  part: UIMessage['parts'][number],
): IAgentPageSelectionContext[] => {
  if (part.type !== AGENTS_PAGE_SELECTIONS_DATA_TYPE || !('data' in part))
    return [];
  const result = z
    .object({ selections: agentsPageSelectionsSchema })
    .safeParse(part.data);
  return result.success ? result.data.selections : [];
};
export const pageSelectionsDisplayText = (
  parts: UIMessage['parts'],
): string | undefined => {
  for (const part of parts) {
    if (part.type !== AGENTS_PAGE_SELECTIONS_DATA_TYPE || !('data' in part))
      continue;
    const result = z
      .object({
        selections: agentsPageSelectionsSchema,
        displayText: z.string(),
      })
      .safeParse(part.data);
    if (result.success) return result.data.displayText;
  }
  return undefined;
};
