import { IAttachment } from 'erxes-ui';
import { z } from 'zod';

export const FIELD_VALIDATOR_SCHEMA = z
  .object({
    type: z.enum(['PRESET', 'CUSTOM', 'NONE']),
    presetKey: z
      .enum([
        'EMAIL',
        'PHONE',
        'POSTAL_CODE',
        'ALPHANUMERIC',
        'MN_VEHICLE_REGISTRATION',
        'NUMBER',
        'DATE',
        'DATE_TIME',
      ])
      .nullish(),
    customRegex: z.string().nullish(),
    errorMessage: z.string().nullish(),
  })
  .nullish();

export const FORM_GENERAL_SCHEMA = z.object({
  primaryColor: z.string(),
  appearance: z.string(),
  loadType: z.string(),
  title: z.string(),
  description: z.string(),
  buttonText: z.string(),
  channelId: z.string(),
  saveAsCustomer: z.boolean().optional(),
});

export const FORM_GENERAL_CREATE_SCHEMA = FORM_GENERAL_SCHEMA.extend({
  channelId: z.string().min(1, { message: 'Channel is required' }),
});

export const FORM_CALLOUT_SCHEMA = z.object({
  title: z.string(),
  body: z.string(),
  buttonText: z.string(),
  featuredImage: z.string().nullable(),
  skip: z.boolean(),
});

export const FORM_CONFIRMATION_SCHEMA = z.object({
  title: z.string(),
  description: z.string(),
  image: z.custom<IAttachment>().nullable(),
});

export const FORM_CONTENT_SCHEMA = z.object({
  steps: z.record(
    z.string(),
    z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      order: z.number(),
      fields: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          label: z.string(),
          description: z.string(),
          placeholder: z.string().optional(),
          options: z.array(z.string()),
          span: z.number().optional().default(1),
          required: z.boolean().optional().default(false),
          order: z.number().optional().default(0),
          stepId: z.string(),
          validation: z.string().optional().default('').nullable(),
          logics: z
            .array(
              z.object({
                fieldId: z.string(),
                logicOperator: z.string().nullish(),
                logicValue: z.any().optional(),
              }),
            )
            .optional(),
          logicAction: z.string().optional().default(''),
          allowSearch: z.boolean().optional().default(false),
          validator: FIELD_VALIDATOR_SCHEMA.optional(),
        }),
      ),
    }),
  ),
});

const isAttachment = (value: unknown): value is IAttachment =>
  typeof value === 'object' &&
  value !== null &&
  'url' in value &&
  typeof value.url === 'string';

// `leadData` is a free-form JSON field the widget reads too. Every leaf falls
// back on its own, so one malformed value never drops the rest of the form.
export const LEAD_DATA_SCHEMA = z
  .object({
    appearance: z.string().optional().catch(undefined),
    loadType: z.string().optional().catch(undefined),
    saveAsCustomer: z.boolean().optional().catch(undefined),
    primaryColor: z.string().optional().catch(undefined),
    callout: z
      .object({
        title: z.string().optional().catch(undefined),
        body: z.string().optional().catch(undefined),
        buttonText: z.string().optional().catch(undefined),
        featuredImage: z.string().nullish().catch(undefined),
        skip: z.boolean().optional().catch(undefined),
      })
      .optional()
      .catch(undefined),
    thankTitle: z.string().optional().catch(undefined),
    thankContent: z.string().optional().catch(undefined),
    thankImage: z.custom<IAttachment>(isAttachment).nullish().catch(undefined),
    successImage: z.string().optional().catch(undefined),
    steps: z
      .record(
        z.string(),
        z.object({
          name: z.string().optional().catch(undefined),
          description: z.string().optional().catch(undefined),
          order: z.number().catch(0),
        }),
      )
      .optional()
      .catch(undefined),
  })
  .catch({});
