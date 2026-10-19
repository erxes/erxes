import { z } from 'zod';
import type {
  SalesLoyaltyRulesQuery,
  SalesLoyaltyTierRulesQuery,
} from '~/gql/graphql';
import { LOYALTY_RULE_TYPES } from './constants';

const ruleRowSchema = z
  .object({
    _id: z.string().optional(),
    type: z
      .string()
      .refine(
        (value) => z.nativeEnum(LOYALTY_RULE_TYPES).safeParse(value).success,
      ),
    scoreCampaignId: z.string(),
    boardId: z.string().optional(),
    pipelineId: z.string().optional(),
    earnProbability: z.string().optional(),
    refundProbability: z.string().optional(),
    earnStageIds: z.array(z.string()),
    refundStageIds: z.array(z.string()),
  })
  .superRefine((row, ctx) => {
    const specific = row.type === LOYALTY_RULE_TYPES.SPECIFIC_STAGES;
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

    if (!row.scoreCampaignId) {
      issue('scoreCampaignId', 'loyalty-rules-no-campaign');
    }

    if (row.type !== LOYALTY_RULE_TYPES.EVERY_BOARD && !row.boardId) {
      issue('boardId', 'loyalty-rules-no-board');
    }

    if (specific && !row.pipelineId) {
      issue('pipelineId', 'loyalty-rules-no-pipeline');
    }

    if (specific ? !row.earnStageIds.length : !row.earnProbability) {
      issue(
        specific ? 'earnStageIds' : 'earnProbability',
        'loyalty-rules-no-earn',
      );
    }

    const overlaps = specific
      ? row.earnStageIds.some((id) => row.refundStageIds.includes(id))
      : !!row.earnProbability && row.earnProbability === row.refundProbability;

    if (overlaps) {
      issue(
        specific ? 'refundStageIds' : 'refundProbability',
        'loyalty-rules-earn-and-refund',
      );
    }
  });

export const loyaltyRulesFormSchema = z.object({
  rules: z.array(ruleRowSchema),
});

export type TLoyaltyRulesForm = z.infer<typeof loyaltyRulesFormSchema>;
export type TLoyaltyRuleRow = TLoyaltyRulesForm['rules'][number];

export type TLoyaltyRule = NonNullable<
  NonNullable<SalesLoyaltyRulesQuery['salesLoyaltyRules']>[number]
>;

const tierRowSchema = z
  .object({
    _id: z.string().optional(),
    type: z
      .string()
      .refine(
        (value) => z.nativeEnum(LOYALTY_RULE_TYPES).safeParse(value).success,
      ),
    accountTypeId: z.string(),
    bands: z.array(
      z.object({
        tier: z.string(),
        min: z.number().optional(),
        max: z.number().optional(),
      }),
    ),
    onlyUpgrade: z.boolean(),
    boardId: z.string().optional(),
    pipelineId: z.string().optional(),
    earnProbability: z.string().optional(),
    earnStageIds: z.array(z.string()),
  })
  .superRefine((row, ctx) => {
    const specific = row.type === LOYALTY_RULE_TYPES.SPECIFIC_STAGES;
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

    if (!row.accountTypeId) {
      issue('accountTypeId', 'loyalty-tier-no-wallet');
    } else if (!row.bands.length) {
      issue('bands', 'loyalty-tier-no-bands');
    }

    if (row.type !== LOYALTY_RULE_TYPES.EVERY_BOARD && !row.boardId) {
      issue('boardId', 'loyalty-rules-no-board');
    }

    if (specific && !row.pipelineId) {
      issue('pipelineId', 'loyalty-rules-no-pipeline');
    }

    if (specific ? !row.earnStageIds.length : !row.earnProbability) {
      issue(
        specific ? 'earnStageIds' : 'earnProbability',
        'loyalty-tier-no-place',
      );
    }
  });

export const loyaltyTierRulesFormSchema = z.object({
  rules: z.array(tierRowSchema),
});

export type TLoyaltyTierRulesForm = z.infer<typeof loyaltyTierRulesFormSchema>;
export type TLoyaltyTierRuleRow = TLoyaltyTierRulesForm['rules'][number];

export type TLoyaltyTierRule = NonNullable<
  NonNullable<SalesLoyaltyTierRulesQuery['salesLoyaltyTierRules']>[number]
>;
