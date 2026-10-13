import {
  IconGitBranch,
  IconLayoutBoard,
  IconWorld,
  TablerIcon,
} from '@tabler/icons-react';

export const LOYALTY_RULE_TYPES = {
  EVERY_BOARD: 'everyBoard',
  EVERY_PIPELINE: 'everyPipeline',
  SPECIFIC_STAGES: 'specificStages',
} as const;

export type TLoyaltyRuleType =
  (typeof LOYALTY_RULE_TYPES)[keyof typeof LOYALTY_RULE_TYPES];

// Widest first: each group overrides the ones above it for its campaign.
export const LOYALTY_RULE_GROUPS: {
  type: TLoyaltyRuleType;
  labelKey: string;
  hintKey: string;
  icon: TablerIcon;
}[] = [
  {
    type: LOYALTY_RULE_TYPES.EVERY_BOARD,
    labelKey: 'loyalty-rules-every-board',
    hintKey: 'loyalty-rules-every-board-hint',
    icon: IconWorld,
  },
  {
    type: LOYALTY_RULE_TYPES.EVERY_PIPELINE,
    labelKey: 'loyalty-rules-every-pipeline',
    hintKey: 'loyalty-rules-every-pipeline-hint',
    icon: IconLayoutBoard,
  },
  {
    type: LOYALTY_RULE_TYPES.SPECIFIC_STAGES,
    labelKey: 'loyalty-rules-specific-stages',
    hintKey: 'loyalty-rules-specific-stages-hint',
    icon: IconGitBranch,
  },
];

// Loyalty draws the picker for it, new and edit included.
export const SCORE_CAMPAIGN_CONTENT_TYPE = 'loyalty:score.campaigns';

export const ADJUST_SCORE_ACTION_TYPE = 'loyalty:score.score.create';
