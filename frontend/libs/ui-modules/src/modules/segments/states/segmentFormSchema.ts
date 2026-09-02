import { z } from 'zod';

const fieldNodeSchema = z.object({
  kind: z.literal('field'),
  contentType: z.string().min(1),
  fieldKey: z.string().min(1, 'Pick a property'),
  operator: z.string().min(1, 'Pick a condition'),
  value: z
    .union([z.string(), z.number(), z.boolean(), z.array(z.string())])
    .optional(),
  meta: z.record(z.string(), z.string()).optional(),
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

const referenceNodeSchema = z.object({
  kind: z.literal('segment'),
  segmentId: z.string().min(1, 'Pick a segment'),
  exclude: z.boolean().optional(),
});

export const segmentNodeSchema: z.ZodType<{
  kind: 'group' | 'field' | 'relation' | 'segment';
}> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('group'),
      conjunction: z.enum(['and', 'or']),
      children: z.array(segmentNodeSchema).min(1, 'Add at least one condition'),
    }),
    fieldNodeSchema,
    relationNodeSchema,
    referenceNodeSchema,
  ]),
);

export const segmentFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
  visibility: z.enum(['private', 'organization']),
  root: segmentNodeSchema,
});
