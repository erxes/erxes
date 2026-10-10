import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IConfigDocument } from '~/modules/posclient/@types/configs';

const POS_ORDER_TRIGGER = 'sales:pos.orders.event';
const ADJUST_SCORE_ACTION = 'loyalty:score.score.create';

type TNode = { type: string; config?: Record<string, unknown> };
type TActiveAutomation = { triggers?: TNode[]; actions?: TNode[] };

type TEarnRule = { campaignId: string; earnRowKeys?: string[] };

type TEarnRulePreview = {
  campaignId: string;
  campaignTitle: string;
  accountTypeName: string;
  points: number;
  skips: { reason: string }[];
  error?: string;
};

const asString = (value: unknown) => (typeof value === 'string' ? value : '');

// The same scope sales checks when the order is paid; payment type is unknown
// before paying, so a trigger narrowed by it still counts here.
const startsOnPaidOrder = (
  trigger: TNode,
  config: IConfigDocument,
  orderType?: string,
) => {
  const {
    eventType,
    posId,
    posToken,
    orderType: triggerOrderType,
  } = trigger.config || {};

  return (
    trigger.type === POS_ORDER_TRIGGER &&
    (eventType || 'paid') === 'paid' &&
    (!posId || posId === config.posId) &&
    (!posToken || posToken === config.token) &&
    (!triggerOrderType || !orderType || triggerOrderType === orderType)
  );
};

// Every Adjust score an active automation would run when this POS's order is
// paid. Branches before the action are not evaluated.
const findEarnRules = async (
  subdomain: string,
  config: IConfigDocument,
  orderType?: string,
): Promise<TEarnRule[]> => {
  const automations: TActiveAutomation[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'automation',
    action: 'findActive',
    input: {
      triggerTypes: [POS_ORDER_TRIGGER],
      actionTypes: [ADJUST_SCORE_ACTION],
    },
    defaultValue: [],
    throwOnError: true,
  });

  return automations
    .filter(({ triggers }) =>
      (triggers || []).some((trigger) =>
        startsOnPaidOrder(trigger, config, orderType),
      ),
    )
    .flatMap(({ actions }) =>
      (actions || []).flatMap(({ type, config: actionConfig }) => {
        const campaignId = asString(actionConfig?.campaignId);
        const earnRowKeys = actionConfig?.earnRowKeys;

        return type === ADJUST_SCORE_ACTION && campaignId
          ? [
              {
                campaignId,
                earnRowKeys: Array.isArray(earnRowKeys)
                  ? earnRowKeys.filter(
                      (key): key is string => typeof key === 'string',
                    )
                  : undefined,
              },
            ]
          : [];
      }),
    );
};

/** What paying this cart would earn the customer, before it is paid. */
export const previewLoyaltyEarn = async (
  subdomain: string,
  config: IConfigDocument,
  {
    customerId,
    orderType,
    totalAmount,
    items,
  }: {
    customerId?: string;
    orderType?: string;
    totalAmount: number;
    items: { productId: string; amount: number }[];
  },
) => {
  // The POS's own earning campaign, then any automation's; one per campaign.
  const rules = [
    ...(config.earnScoreCampaignId
      ? [{ campaignId: config.earnScoreCampaignId }]
      : []),
    ...(await findEarnRules(subdomain, config, orderType)),
  ].filter(
    (rule, index, all) =>
      all.findIndex(({ campaignId }) => campaignId === rule.campaignId) ===
      index,
  );

  if (!rules.length || !customerId) {
    return { hasRules: rules.length > 0, earns: [] };
  }

  const earns: TEarnRulePreview[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'loyalty',
    method: 'query',
    module: 'score',
    action: 'earnPreview',
    input: {
      ownerType: 'customer',
      ownerId: customerId,
      rules,
      // Before paying, the whole total counts as paid with money.
      purchase: { totalAmount, paidAmount: totalAmount, items },
    },
    defaultValue: [],
    throwOnError: true,
  });

  return {
    hasRules: true,
    earns: earns.map(
      ({ campaignTitle, accountTypeName, points, skips, error }) => ({
        walletName: accountTypeName || campaignTitle,
        points,
        reasons: skips.map(({ reason }) => reason),
        error,
      }),
    ),
  };
};
