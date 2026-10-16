import { isRecord } from '@/deals/utils/dealJson';
import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { Control, useWatch } from 'react-hook-form';
import { ADJUST_SCORE_ACTION_TYPE, LOYALTY_RULE_TYPES } from '../constants';
import { SALES_LOYALTY_RULE_AUTOMATIONS } from '../graphql/loyaltyRulesQueries';
import { TLoyaltyRuleRow, TLoyaltyRulesForm } from '../types';

const DEAL_TRIGGER_TYPES = [
  'sales:sales.deals',
  'sales:sales.deals.probability',
  'sales:sales.deals.stageChanged',
];

// A narrower rule of the same campaign takes over where it reaches.
const overridesWider = (row: TLoyaltyRuleRow, rows: TLoyaltyRuleRow[]) =>
  row.type !== LOYALTY_RULE_TYPES.EVERY_BOARD &&
  rows.some(
    (other) =>
      other !== row &&
      other.scoreCampaignId === row.scoreCampaignId &&
      (other.type === LOYALTY_RULE_TYPES.EVERY_BOARD ||
        (row.type === LOYALTY_RULE_TYPES.SPECIFIC_STAGES &&
          other.type === LOYALTY_RULE_TYPES.EVERY_PIPELINE &&
          other.boardId === row.boardId)),
  );

/** What the admin should know before saving: overrides, competing writers. */
export const useLoyaltyRuleNotes = (
  control: Control<TLoyaltyRulesForm>,
  enabled: boolean,
) => {
  const rows = useWatch({ control, name: 'rules' }) || [];

  const { data } = useQuery(SALES_LOYALTY_RULE_AUTOMATIONS, {
    variables: {
      triggerTypes: DEAL_TRIGGER_TYPES,
      actionTypes: [ADJUST_SCORE_ACTION_TYPE],
    },
    skip: !enabled,
  });

  const ruleCampaignIds = new Set(rows.map((row) => row.scoreCampaignId));
  const competingAutomations = (data?.automations || [])
    .filter(isDefined)
    .filter(
      ({ status, actions }) =>
        status === 'active' &&
        (actions || [])
          .filter(isDefined)
          .some(
            ({ type, config }) =>
              type === ADJUST_SCORE_ACTION_TYPE &&
              isRecord(config) &&
              typeof config.campaignId === 'string' &&
              ruleCampaignIds.has(config.campaignId),
          ),
    );

  return {
    overrides: (index: number) =>
      !!rows[index] && overridesWider(rows[index], rows),
    competingAutomations,
  };
};
