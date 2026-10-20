import { ADJUST_SCORE_ACTION_TYPE } from '@/deals/loyaltyRules/constants';
import { SALES_LOYALTY_RULE_AUTOMATIONS } from '@/deals/loyaltyRules/graphql/loyaltyRulesQueries';
import { isRecord } from '@/deals/utils/dealJson';
import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { SalesLoyaltyRuleAutomationsQuery } from '~/gql/graphql';
type Automation = NonNullable<
  NonNullable<SalesLoyaltyRuleAutomationsQuery['automations']>[number]
>;
type AutomationNode = NonNullable<NonNullable<Automation['triggers']>[number]>;

const POS_ORDER_TRIGGER = 'sales:pos.orders.event';

/**
 * Active automations that already give points for this POS's orders, by
 * campaign: the same campaign here too would have two writers.
 */
export const usePosEarnAutomations = (posId?: string) => {
  const { t } = useTranslation('sales');
  const { data } = useQuery(SALES_LOYALTY_RULE_AUTOMATIONS, {
    variables: {
      triggerTypes: [POS_ORDER_TRIGGER],
      actionTypes: [ADJUST_SCORE_ACTION_TYPE],
    },
    fetchPolicy: 'cache-and-network',
  });

  const reachesThisPos = ({ type, config }: AutomationNode) =>
    type === POS_ORDER_TRIGGER &&
    (!isRecord(config) || !config.posId || config.posId === posId);

  const automationNamesFor = (campaignId: string) =>
    (data?.automations || [])
      .filter(isDefined)
      .filter(
        ({ status, triggers, actions }) =>
          status === 'active' &&
          (triggers || []).filter(isDefined).some(reachesThisPos) &&
          (actions || [])
            .filter(isDefined)
            .some(
              ({ type, config }) =>
                type === ADJUST_SCORE_ACTION_TYPE &&
                isRecord(config) &&
                config.campaignId === campaignId,
            ),
      )
      .map(({ name }) => name || t('untitled'));

  return { automationNamesFor };
};
