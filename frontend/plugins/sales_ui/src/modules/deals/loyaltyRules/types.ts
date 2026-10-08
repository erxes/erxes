import { z } from 'zod';
import { LOYALTY_RULE_TYPES } from './constants';

const ruleRowSchema = z
  .object({
    _id: z.string().optional(),
    type: z.nativeEnum(LOYALTY_RULE_TYPES),
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

type TPlace = { probability?: string | null; stageIds?: string[] | null };

export type TLoyaltyRule = {
  _id: string;
  type: TLoyaltyRuleRow['type'];
  scoreCampaignId: string;
  boardId?: string | null;
  pipelineId?: string | null;
  earn?: TPlace | null;
  refund?: TPlace | null;
};
