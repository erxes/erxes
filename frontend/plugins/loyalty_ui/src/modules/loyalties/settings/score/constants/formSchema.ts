import { z } from 'zod';

export const cardBasedRuleSchema = z.object({
  boardId: z.string().optional(),
  pipelineId: z.string().optional(),
  stageIds: z.array(z.string()).optional(),
  refundStageIds: z.array(z.string()).optional(),
});

export const loyaltyScoreFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  conditions: z.object({
    productCategoryIds: z.array(z.string()).optional(),
    productIds: z.array(z.string()).optional(),
    tagIds: z.array(z.string()).optional(),
    excludeProductCategoryIds: z.array(z.string()).optional(),
    excludeProductIds: z.array(z.string()).optional(),
    excludeTagIds: z.array(z.string()).optional(),
    serviceName: z.string().min(1, 'Service is required'),
  }),
  additionalConfig: z
    .object({
      discountCheck: z.boolean().optional(),
      cardBasedRule: z.array(cardBasedRuleSchema).optional(),
    })
    .optional(),
  add: z
    .object({
      placeholder: z.string().optional(),
      currencyRatio: z.string().optional(),
    })
    .optional(),
  subtract: z
    .object({
      placeholder: z.string().optional(),
      currencyRatio: z.string().optional(),
    })
    .optional(),
  ownerType: z.string().optional(),
  onlyClientPortal: z.boolean().optional(),
  fieldGroupId: z.string().optional(),
  fieldOrigin: z.enum(['new', 'exists']).optional(),
  fieldName: z.string().optional(),
  fieldId: z.string().optional(),
});

export type LoyaltyScoreFormValues = z.infer<typeof loyaltyScoreFormSchema>;
export type CardBasedRule = z.infer<typeof cardBasedRuleSchema>;
