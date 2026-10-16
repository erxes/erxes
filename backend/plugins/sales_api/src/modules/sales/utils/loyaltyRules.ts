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

// Where a rule reaches; points and tier rules share it.
type TPlacedRule = {
  _id: string;
  type: TLoyaltyRuleType;
  boardId?: string;
  pipelineId?: string;
  earn?: TLoyaltyRulePlace;
};

export type TLoyaltyRule = TPlacedRule & {
  scoreCampaignId: string;
  refund?: TLoyaltyRulePlace;
};

export type TLoyaltyTierBand = {
  tier: string;
  min?: number | null;
  max?: number | null;
};

// The tier a purchase earns by its amount, set where `earn` points.
export type TLoyaltyTierRule = TPlacedRule & {
  accountTypeId: string;
  bands: TLoyaltyTierBand[];
  onlyUpgrade?: boolean;
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

export type TLoyaltyTierRuleIssue =
  | 'no-wallet'
  | 'no-bands'
  | 'no-board'
  | 'no-pipeline'
  | 'no-earn';

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

const reaches = (rule: TPlacedRule, place: TStagePlace) => {
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
  rule: TPlacedRule,
  target: TLoyaltyRulePlace | undefined,
  place: TStagePlace,
) =>
  rule.type === LOYALTY_RULE_TYPES.SPECIFIC_STAGES
    ? !!target?.stageIds?.includes(place.stageId)
    : !!target?.probability && target.probability === place.probability;

// Per key only the narrowest rule reaching the place counts.
const narrowestByKey = <T extends TPlacedRule>(
  rules: T[],
  place: TStagePlace,
  keyOf: (rule: T) => string | undefined,
) => {
  const governing = new Map<string, T>();

  for (const rule of rules) {
    const key = keyOf(rule);

    if (!key || !reaches(rule, place)) {
      continue;
    }

    const current = governing.get(key);

    if (!current || SPECIFICITY[rule.type] > SPECIFICITY[current.type]) {
      governing.set(key, rule);
    }
  }

  return [...governing.values()];
};

/**
 * What the rules say about one stage. Per campaign only the narrowest rule
 * reaching it counts: a pipeline's own stages replace its board's rule, and
 * a board's rule replaces the one for every board.
 */
export const resolveLoyaltyRules = (
  rules: TLoyaltyRule[],
  place: TStagePlace,
): TResolvedLoyaltyRules => {
  const chosen = narrowestByKey(rules, place, (rule) => rule.scoreCampaignId);

  return {
    earns: chosen
      .filter((rule) => covers(rule, rule.earn, place))
      .map((rule) => ({ campaignId: rule.scoreCampaignId, ruleId: rule._id })),
    refunds: chosen.some((rule) => covers(rule, rule.refund, place)),
  };
};

/**
 * The one tier rule a stage sets, if any: the narrowest rule reaching it,
 * whichever wallet it names, decides alone.
 */
export const resolveLoyaltyTierRule = (
  rules: TLoyaltyTierRule[],
  place: TStagePlace,
): TLoyaltyTierRule | null => {
  const [rule] = narrowestByKey(rules, place, () => 'tier');

  return rule && covers(rule, rule.earn, place) ? rule : null;
};

const placeIssue = (
  rule: Omit<TPlacedRule, '_id'>,
): 'no-board' | 'no-pipeline' | 'no-earn' | null => {
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

  return null;
};

/** Why a rule cannot be saved, or null when it can. */
export const loyaltyRuleIssue = (
  rule: Omit<TLoyaltyRule, '_id'>,
): TLoyaltyRuleIssue | null => {
  if (!rule.scoreCampaignId) {
    return 'no-campaign';
  }

  const issue = placeIssue(rule);

  if (issue) {
    return issue;
  }

  const specific = rule.type === LOYALTY_RULE_TYPES.SPECIFIC_STAGES;
  const overlaps = specific
    ? (rule.earn?.stageIds || []).some((id) =>
        rule.refund?.stageIds?.includes(id),
      )
    : rule.earn?.probability === rule.refund?.probability;

  return overlaps ? 'earn-and-refund' : null;
};

/** Why a tier rule cannot be saved, or null when it can. */
export const loyaltyTierRuleIssue = (
  rule: Omit<TLoyaltyTierRule, '_id'>,
): TLoyaltyTierRuleIssue | null => {
  if (!rule.accountTypeId) {
    return 'no-wallet';
  }

  if (!rule.bands?.length || rule.bands.some(({ tier }) => !tier)) {
    return 'no-bands';
  }

  return placeIssue(rule);
};
