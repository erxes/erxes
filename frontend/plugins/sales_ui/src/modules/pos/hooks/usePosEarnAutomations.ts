import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { SALES_LOYALTY_RULE_AUTOMATIONS } from '@/deals/loyaltyRules/graphql/loyaltyRulesQueries';
import { ADJUST_SCORE_ACTION_TYPE } from '@/deals/loyaltyRules/constants';

const POS_ORDER_TRIGGER = 'sales:pos.orders.event';

type TNode = { type: string; config?: Record<string, unknown> };
type TAutomation = {
  _id: string;
  name?: string;
  status?: string;
  triggers?: TNode[];
  actions?: TNode[];
};

/**
 * Active automations that already give points for this POS's orders, by
 * campaign: the same campaign here too would have two writers.
 */
export const usePosEarnAutomations = (posId?: string) => {
  const { t } = useTranslation('sales');
  const { data } = useQuery<{ automations: TAutomation[] }>(
    SALES_LOYALTY_RULE_AUTOMATIONS,
    {
      variables: {
        triggerTypes: [POS_ORDER_TRIGGER],
        actionTypes: [ADJUST_SCORE_ACTION_TYPE],
      },
      fetchPolicy: 'cache-and-network',
    },
  );

  const reachesThisPos = ({ type, config }: TNode) =>
    type === POS_ORDER_TRIGGER && (!config?.posId || config.posId === posId);

  const automationNamesFor = (campaignId: string) =>
    (data?.automations || [])
      .filter(
        ({ status, triggers, actions }) =>
          status === 'active' &&
          (triggers || []).some(reachesThisPos) &&
          (actions || []).some(
            ({ type, config }) =>
              type === ADJUST_SCORE_ACTION_TYPE &&
              config?.campaignId === campaignId,
          ),
      )
      .map(({ name }) => name || t('untitled'));

  return { automationNamesFor };
};
