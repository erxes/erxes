import { useTranslation } from 'react-i18next';
import { SourceAutomations } from '@/automations/components/SourceAutomations';
import { TSourceTrigger } from '@/automations/hooks/useSourceAutomations';
import { POS_ORDER_TRIGGER_TYPE } from '@/pos/hooks/usePosPurchaseContext';

/** What this POS's orders set off, and where new rules for them start. */
export const PosAutomations = ({
  posId,
  posName,
}: {
  posId?: string;
  posName?: string;
}) => {
  const { t } = useTranslation('sales');
  const label = posName || 'POS';

  // A trigger with no POS runs on every POS, this one included.
  const scopeOf = ({ config }: TSourceTrigger) =>
    !config?.posId ? 'all' : config.posId === posId ? 'own' : null;

  return (
    <SourceAutomations
      label={label}
      triggerTypes={[POS_ORDER_TRIGGER_TYPE]}
      scopeOf={scopeOf}
      describe={({ config }) => String(config?.eventType || '')}
      newTrigger={
        posId ? { type: POS_ORDER_TRIGGER_TYPE, config: { posId } } : undefined
      }
      hint={t(
        'pos-automations-hint',
        'Rules that run on this POS’s orders: points, vouchers, messages. Each one is a regular automation you can edit in the builder.',
      )}
      empty={t(
        'pos-automations-empty',
        'No automation runs on this POS’s orders yet.',
      )}
      allLabel={t('pos-automation-all-pos', 'All POS')}
    />
  );
};
