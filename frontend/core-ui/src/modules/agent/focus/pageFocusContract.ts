import { z } from 'zod';

export interface IPageElementCatalog {
  snapshotId: string;
  path: string;
  elements: {
    id: string;
    label: string;
    role: string;
    context: string;
    frame?: string;
  }[];
}
const pageFocusSchema = z.object({
  kind: z.literal('page-focus'),
  version: z.literal(1),
  snapshotId: z.string().uuid(),
  targetId: z.string().regex(/^element-[0-9]{1,4}$/),
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
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
});
export type IPageFocus = z.infer<typeof pageFocusSchema>;
export const readPageFocus = (value: unknown): IPageFocus | undefined => {
  const result = pageFocusSchema.safeParse(value);
  return result.success ? result.data : undefined;
};
