import { z } from 'zod';

const label = z.string().trim().min(1).max(100);
const presentation = {
  labelSingular: label,
  labelPlural: label,
  description: z.string().trim().max(2000),
  icon: z
    .string()
    .trim()
    .regex(/^Icon[A-Za-z0-9]{1,60}$/),
};

export const dataModelCreateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .regex(
        /^[a-z][a-z0-9_]{0,62}$/,
        'Use 1–63 lowercase letters, numbers or underscores, starting with a letter',
      ),
    labelSingular: presentation.labelSingular,
    labelPlural: presentation.labelPlural,
    description: presentation.description.default(''),
    icon: presentation.icon.default('IconDatabase'),
  })
  .strict();

// Names, ownership, content types, versions and system fields are server-owned.
export const dataModelUpdateSchema = z
  .object({
    ...presentation,
    recordLabelField: z.string().trim().min(1).max(128).nullable(),
    recordImageField: z.string().trim().min(1).max(128).nullable(),
  })
  .partial()
  .strict()
  .refine(
    (value) => Object.values(value).some((entry) => entry !== undefined),
    {
      message: 'At least one model setting is required',
    },
  );

export const dataModelListSchema = z
  .object({
    archived: z.boolean().default(false),
    limit: z.number().int().min(1).max(200).default(50),
    offset: z.number().int().min(0).max(100000).default(0),
  })
  .strict();

export const dataModelVersionSchema = z.number().int().min(1);
export const dataModelActorSchema = z.string().trim().min(1).max(128);

export type DataModelCreateInput = z.input<typeof dataModelCreateSchema>;
export type DataModelUpdateInput = z.input<typeof dataModelUpdateSchema>;
