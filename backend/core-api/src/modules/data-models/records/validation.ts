import { z } from 'zod';

const unsafeKeys = new Set(['__proto__', 'constructor', 'prototype']);

export const dataModelRecordIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{1,64}$/)
  .refine(
    (value) => !unsafeKeys.has(value),
    'Reserved record or field identity',
  );

export const dataModelRecordInputSchema = z
  .object({
    propertiesData: z
      .record(dataModelRecordIdSchema, z.unknown())
      .refine(
        (values) => Object.keys(values).length <= 200,
        'At most 200 values per write',
      ),
  })
  .strict();

export const dataModelRecordListSchema = z
  .object({
    deleted: z.boolean().default(false),
    recordId: dataModelRecordIdSchema.optional(),
    limit: z.number().int().min(1).max(200).default(50),
    offset: z.number().int().min(0).max(100000).default(0),
    filters: z
      .array(
        z
          .object({
            fieldId: dataModelRecordIdSchema,
            operator: z.enum([
              'EQ',
              'NE',
              'GT',
              'GTE',
              'LT',
              'LTE',
              'IN',
              'CONTAINS',
              'IS_EMPTY',
              'IS_NOT_EMPTY',
            ]),
            value: z.unknown().optional(),
          })
          .strict(),
      )
      .max(20)
      .default([]),
    sort: z
      .object({
        field: dataModelRecordIdSchema,
        direction: z.enum(['ASC', 'DESC']),
      })
      .strict()
      .optional(),
  })
  .strict();

export type DataModelRecordInput = z.input<typeof dataModelRecordInputSchema>;
export type DataModelRecordListInput = z.input<
  typeof dataModelRecordListSchema
>;
