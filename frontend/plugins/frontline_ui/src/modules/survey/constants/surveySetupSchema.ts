import { z } from 'zod';
import {
  MAX_SURVEY_OPTIONS,
  MAX_SURVEY_STEPS,
} from '@/survey/types/surveyTypes';

export const SURVEY_GENERAL_SCHEMA = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150),
  brandId: z.string().nullable(),
});

const SURVEY_STEP_OPTION_SCHEMA = z
  .object({
    _id: z.string().optional(),
    key: z.string(),
    text: z.string().trim().min(1, 'Option cannot be empty').max(100),
    ticketCreationEnabled: z.boolean(),
    ticketCreationThreshold: z.number().int().min(1).nullable(),
    ticketPipelineId: z.string().nullable(),
    ticketStatusId: z.string().nullable(),
    ticketCreated: z.boolean().optional(),
    ticketId: z.string().nullable().optional(),
  })
  .superRefine((option, ctx) => {
    if (!option.ticketCreationEnabled) {
      return;
    }

    if (!option.ticketCreationThreshold) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Set the vote count that triggers the ticket',
        path: ['ticketCreationThreshold'],
      });
    }

    if (!option.ticketPipelineId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Choose a pipeline',
        path: ['ticketPipelineId'],
      });
    }

    if (!option.ticketStatusId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Choose a status',
        path: ['ticketStatusId'],
      });
    }
  });

const SURVEY_STEP_SCHEMA = z.object({
  _id: z.string().optional(),
  key: z.string(),
  name: z.string().trim().max(100),
  description: z.string().max(300),
  question: z.string().trim().min(1, 'Question is required').max(300),
  allowMultiselect: z.boolean(),
  options: z
    .array(SURVEY_STEP_OPTION_SCHEMA)
    .min(2, 'A step needs at least 2 options')
    .max(MAX_SURVEY_OPTIONS)
    .superRefine((options, ctx) => {
      const seen = new Set<string>();

      options.forEach((option, index) => {
        const key = option.text.trim().toLowerCase();

        if (seen.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Options must be unique',
            path: [index, 'text'],
          });
        }

        seen.add(key);
      });
    }),
});

export const SURVEY_CONTENT_SCHEMA = z.object({
  steps: z.array(SURVEY_STEP_SCHEMA).min(1).max(MAX_SURVEY_STEPS),
});

export const SURVEY_CONFIRMATION_SCHEMA = z.object({
  durationHours: z.number().int().min(1).max(768).nullable(),
});

export type TSurveyGeneral = z.infer<typeof SURVEY_GENERAL_SCHEMA>;
export type TSurveyContent = z.infer<typeof SURVEY_CONTENT_SCHEMA>;
export type TSurveyContentStep = z.infer<typeof SURVEY_STEP_SCHEMA>;
export type TSurveyConfirmation = z.infer<typeof SURVEY_CONFIRMATION_SCHEMA>;
