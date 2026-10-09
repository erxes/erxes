import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  IRelationSettingsPurchaseHistory,
  IRelationSettingsWidgetContext,
  TSegmentFieldNode,
} from 'ui-modules';

// The trigger's relationType ('event') is part of its registered type.
export const POS_ORDER_TRIGGER_TYPE = 'sales:pos.orders.event';

const POS_ORDER_SEGMENT_TYPE = 'sales:pos.orders';

const orderCondition = (
  fieldKey: string,
  operator: string,
  value: string,
): TSegmentFieldNode => ({
  kind: 'field',
  contentType: POS_ORDER_SEGMENT_TYPE,
  fieldKey,
  operator,
  value,
});

// A customer's paid orders; the period on the paid date leaves unpaid ones
// out, and returned ones no longer count.
const paidOrdersHistory = (
  posId?: string,
): IRelationSettingsPurchaseHistory => ({
  subjectType: 'core:contacts.customers',
  relationKey: 'customer.posOrders',
  relatedType: POS_ORDER_SEGMENT_TYPE,
  amountField: 'totalAmount',
  dateField: 'paidDate',
  conditions: [
    orderCondition('status', 'dne', 'return'),
    orderCondition('status', 'dne', 'returned'),
    ...(posId ? [orderCondition('posId', 'e', posId)] : []),
  ],
});

// What other plugins' POS settings tabs get: the paid order trigger, at this
// POS or every POS, and how it names the buyer.
export const usePosPurchaseContext = (
  posId?: string,
  posName?: string,
): IRelationSettingsWidgetContext => {
  const { t } = useTranslation('sales');
  const { pathname, search } = useLocation();
  const label = posName || 'POS';

  return {
    triggerType: POS_ORDER_TRIGGER_TYPE,
    buyerAttribution: '{{ trigger.customerId }}',
    scopes: [
      {
        key: 'own',
        label,
        triggerConfig: { eventType: 'paid', posId },
        history: paidOrdersHistory(posId),
      },
      {
        key: 'all',
        label: t('any-pos', 'Any POS'),
        triggerConfig: { eventType: 'paid' },
        history: paidOrdersHistory(),
      },
    ],
    label,
    returnTo: { path: `${pathname}${search}`, label },
  };
};
