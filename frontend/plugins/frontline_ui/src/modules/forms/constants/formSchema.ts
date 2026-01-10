import { z } from 'zod';

export const FORM_APPEARENCE_SCHEMA = z.object({
  primaryColor: z.string(),
  appearance: z.string(),
});

export const FORM_CONTENT_SCHEMA = z.object({
  title: z.string(),
  description: z.string(),
  buttonText: z.string(),
  steps: z.record(
    z.string(),
    z.object({
      order: z.number(),
      fields: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          label: z.string(),
          description: z.string(),
          placeholder: z.string(),
          required: z.boolean(),
          options: z.array(z.string()),
          stepId: z.string(),
          span: z.number().optional().default(1),
          order: z.number(),
        }),
      ),
    }),
  ),
});

// "type": null,
//   "validation": null,
//   "regexValidation": null,
//   "options": null,
//   "locationOptions": [
//     {
//       "description": null,
//       "lat": null,
//       "lng": null
//     }
//   ],
//   "isRequired": null,
//   "order": null,
//   "description": null,
//   "text": null,
//   "code": null
