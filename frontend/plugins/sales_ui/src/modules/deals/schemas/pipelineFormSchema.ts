import { z } from 'zod';

import {
  BOARD_STATUSES_OPTIONS,
  PROBABILITY_DEAL,
  VISIBILITIES,
} from '@/deals/constants/stages';

export type TPipelineValidationMessages = {
  boardRequired: string;
  duplicatePaymentType: string;
  invalidPipelineVisibility: string;
  invalidStageProbability: string;
  invalidStageStatus: string;
  invalidStageVisibility: string;
  numberConfigRequired: string;
  numberSizeRequired: string;
  paymentIconRequired: string;
  paymentTitleRequired: string;
  paymentTypeInvalid: string;
  paymentTypeRequired: string;
  pipelineNameRequired: string;
  stageNameRequired: string;
};

const PIPELINE_VISIBILITIES = VISIBILITIES.map(({ value }) => value);
// Existing pipelines can contain backend-supported terminal probabilities.
const STAGE_PROBABILITIES = [...PROBABILITY_DEAL, 'Done', 'Resolved'];
const STAGE_STATUSES = BOARD_STATUSES_OPTIONS.map(({ value }) => value);
const PAYMENT_TYPE_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*$/;

const isAllowedValue = (value: string, allowedValues: string[]) =>
  allowedValues.includes(value);

export const createPipelineFormSchema = (
  messages: TPipelineValidationMessages,
) => {
  const paymentTypesSchema = z
    .array(
      z.object({
        type: z
          .string()
          .min(1, messages.paymentTypeRequired)
          .regex(PAYMENT_TYPE_PATTERN, messages.paymentTypeInvalid),
        title: z.string().trim().min(1, messages.paymentTitleRequired),
        icon: z.string().trim().min(1, messages.paymentIconRequired),
        config: z.string().optional(),
        scoreCampaignId: z.string().trim().optional(),
      }),
    )
    .superRefine((paymentTypes, context) => {
      const existingTypes = new Set<string>();

      paymentTypes.forEach(({ type }, index) => {
        if (existingTypes.has(type)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: messages.duplicatePaymentType,
            path: [index, 'type'],
          });
        }

        existingTypes.add(type);
      });
    });

  return z
    .object({
      name: z.string().trim().min(1, messages.pipelineNameRequired),
      visibility: z
        .string()
        .trim()
        .refine(
          (value) => isAllowedValue(value, PIPELINE_VISIBILITIES),
          messages.invalidPipelineVisibility,
        ),
      boardId: z.string().trim().min(1, messages.boardRequired),
      tagId: z.string().optional(),
      departmentIds: z.array(z.string()).optional(),
      branchIds: z.array(z.string()).optional(),
      memberIds: z.array(z.string()).optional(),
      numberConfig: z.string().optional(),
      numberSize: z.string().trim().optional(),
      nameConfig: z.string().optional(),
      isCheckDate: z.boolean().optional(),
      isCheckUser: z.boolean().optional(),
      isCheckDepartment: z.boolean().optional(),
      excludeCheckUserIds: z.array(z.string()).optional(),
      initialCategoryIds: z.array(z.string()).optional(),
      excludeCategoryIds: z.array(z.string()).optional(),
      excludeProductIds: z.array(z.string()).optional(),
      paymentIds: z.array(z.string()).optional(),
      paymentTypes: paymentTypesSchema.optional().default([]),
      stages: z
        .array(
          z.object({
            _id: z.string(),
            age: z.number().optional(),
            code: z.string().optional(),
            type: z.string().optional(),
            canMoveMemberIds: z.array(z.string()).optional(),
            canEditMemberIds: z.array(z.string()).optional(),
            memberIds: z.array(z.string()).optional(),
            departmentIds: z.array(z.string()).optional(),
            name: z.string().trim().min(1, messages.stageNameRequired),
            probability: z
              .string()
              .refine(
                (value) => isAllowedValue(value, STAGE_PROBABILITIES),
                messages.invalidStageProbability,
              ),
            status: z
              .string()
              .refine(
                (value) => isAllowedValue(value, STAGE_STATUSES),
                messages.invalidStageStatus,
              ),
            visibility: z
              .string()
              .refine(
                (value) => isAllowedValue(value, PIPELINE_VISIBILITIES),
                messages.invalidStageVisibility,
              ),
            defaultTick: z.boolean().optional(),
          }),
        )
        .optional(),
    })
    .superRefine(({ numberConfig, numberSize }, context) => {
      const hasNumberConfig = Boolean(numberConfig?.trim());
      const hasNumberSize = Boolean(numberSize);

      if (hasNumberConfig && !hasNumberSize) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: messages.numberSizeRequired,
          path: ['numberSize'],
        });
      }

      if (!hasNumberConfig && hasNumberSize) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: messages.numberConfigRequired,
          path: ['numberConfig'],
        });
      }
    });
};
