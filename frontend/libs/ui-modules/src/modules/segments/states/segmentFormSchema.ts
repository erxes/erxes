import { z } from 'zod';

/**
 * The form edits the tree the API stores, so there is no shape to translate on
 * save. `value` is required only for operators that take one, which the field
 * declaration tells us.
 */

const fieldNodeSchema = z.object({
  kind: z.literal('field'),
  contentType: z.string().min(1),
  fieldKey: z.string().min(1, 'Pick a property'),
  operator: z.string().min(1, 'Pick a condition'),
  value: z
    .union([z.string(), z.number(), z.boolean(), z.array(z.string())])
    .optional(),
});

const relationNodeSchema = z.object({
  kind: z.literal('relation'),
  relationKey: z.string().min(1),
  measure: z.union([
    z.object({ op: z.enum(['exists', 'none', 'count']) }),
    z.object({
      op: z.enum(['sum', 'avg', 'min', 'max']),
      fieldKey: z.string().min(1),
    }),
  ]),
  child: z.unknown().optional(),
  operator: z.string().optional(),
  value: z
    .union([z.string(), z.number(), z.boolean(), z.array(z.string())])
    .optional(),
});

export const segmentNodeSchema: z.ZodType<{
  kind: 'group' | 'field' | 'relation';
}> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('group'),
      conjunction: z.enum(['and', 'or']),
      children: z.array(segmentNodeSchema).min(1, 'Add at least one condition'),
    }),
    fieldNodeSchema,
    relationNodeSchema,
  ]),
);

export const segmentFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
  root: segmentNodeSchema,
});
