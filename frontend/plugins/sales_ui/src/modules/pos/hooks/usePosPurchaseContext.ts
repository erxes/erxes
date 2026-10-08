import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { IRelationSettingsWidgetContext } from 'ui-modules';

// The trigger's relationType ('event') is part of its registered type.
export const POS_ORDER_TRIGGER_TYPE = 'sales:pos.orders.event';

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
      { key: 'own', label, triggerConfig: { eventType: 'paid', posId } },
      {
        key: 'all',
        label: t('any-pos', 'Any POS'),
        triggerConfig: { eventType: 'paid' },
      },
    ],
    label,
    returnTo: { path: `${pathname}${search}`, label },
  };
};
