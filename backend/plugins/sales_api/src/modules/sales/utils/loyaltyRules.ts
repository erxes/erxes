export const LOYALTY_RULE_TYPES = {
  EVERY_BOARD: 'everyBoard',
  EVERY_PIPELINE: 'everyPipeline',
  SPECIFIC_STAGES: 'specificStages',
} as const;

export type TLoyaltyRuleType =
  (typeof LOYALTY_RULE_TYPES)[keyof typeof LOYALTY_RULE_TYPES];

export const LOYALTY_RULE_TYPE_VALUES = Object.values(LOYALTY_RULE_TYPES);

// Wider types name stages by probability; a pipeline's own stages by id.
export type TLoyaltyRulePlace = { probability?: string; stageIds?: string[] };

export type TLoyaltyRule = {
  _id: string;
  type: TLoyaltyRuleType;
  scoreCampaignId: string;
  boardId?: string;
  pipelineId?: string;
  earn?: TLoyaltyRulePlace;
  refund?: TLoyaltyRulePlace;
};

export type TStagePlace = {
  boardId?: string;
  pipelineId: string;
  stageId: string;
  probability?: string;
};

export type TLoyaltyRuleIssue =
  | 'no-campaign'
  | 'no-board'
  | 'no-pipeline'
  | 'no-earn'
  | 'earn-and-refund';

export type TResolvedLoyaltyRules = {
  earns: { campaignId: string; ruleId: string }[];
  refunds: boolean;
};

// The narrower a rule, the more it says about this stage.
const SPECIFICITY: Record<TLoyaltyRuleType, number> = {
  [LOYALTY_RULE_TYPES.EVERY_BOARD]: 0,
  [LOYALTY_RULE_TYPES.EVERY_PIPELINE]: 1,
  [LOYALTY_RULE_TYPES.SPECIFIC_STAGES]: 2,
};

const reaches = (rule: TLoyaltyRule, place: TStagePlace) => {
  switch (rule.type) {
    case LOYALTY_RULE_TYPES.EVERY_BOARD:
      return true;
    case LOYALTY_RULE_TYPES.EVERY_PIPELINE:
      return !!place.boardId && rule.boardId === place.boardId;
    case LOYALTY_RULE_TYPES.SPECIFIC_STAGES:
      return rule.pipelineId === place.pipelineId;
    default:
      return false;
  }
};

const covers = (
  rule: TLoyaltyRule,
  target: TLoyaltyRulePlace | undefined,
  place: TStagePlace,
) =>
  rule.type === LOYALTY_RULE_TYPES.SPECIFIC_STAGES
    ? !!target?.stageIds?.includes(place.stageId)
    : !!target?.probability && target.probability === place.probability;

/**
 * What the rules say about one stage. Per campaign only the narrowest rule
 * reaching it counts: a pipeline's own stages replace its board's rule, and
 * a board's rule replaces the one for every board.
 */
export const resolveLoyaltyRules = (
  rules: TLoyaltyRule[],
  place: TStagePlace,
): TResolvedLoyaltyRules => {
  const governing = new Map<string, TLoyaltyRule>();

  for (const rule of rules) {
    if (!rule.scoreCampaignId || !reaches(rule, place)) {
      continue;
    }

    const current = governing.get(rule.scoreCampaignId);

    if (!current || SPECIFICITY[rule.type] > SPECIFICITY[current.type]) {
      governing.set(rule.scoreCampaignId, rule);
    }
  }

  const chosen = [...governing.values()];

  return {
    earns: chosen
      .filter((rule) => covers(rule, rule.earn, place))
      .map((rule) => ({ campaignId: rule.scoreCampaignId, ruleId: rule._id })),
    refunds: chosen.some((rule) => covers(rule, rule.refund, place)),
  };
};

/** Why a rule cannot be saved, or null when it can. */
export const loyaltyRuleIssue = (
  rule: Omit<TLoyaltyRule, '_id'>,
): TLoyaltyRuleIssue | null => {
  if (!rule.scoreCampaignId) {
    return 'no-campaign';
  }

  const specific = rule.type === LOYALTY_RULE_TYPES.SPECIFIC_STAGES;

  if (rule.type !== LOYALTY_RULE_TYPES.EVERY_BOARD && !rule.boardId) {
    return 'no-board';
  }

  if (specific && !rule.pipelineId) {
    return 'no-pipeline';
  }

  if (specific ? !rule.earn?.stageIds?.length : !rule.earn?.probability) {
    return 'no-earn';
  }

  const overlaps = specific
    ? (rule.earn?.stageIds || []).some((id) =>
        rule.refund?.stageIds?.includes(id),
      )
    : rule.earn?.probability === rule.refund?.probability;

  return overlaps ? 'earn-and-refund' : null;
};
