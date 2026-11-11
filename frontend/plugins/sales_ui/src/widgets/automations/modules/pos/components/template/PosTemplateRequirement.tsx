import { useTranslation } from 'react-i18next';
import {
  AutomationTemplateRequirementProps,
  splitAutomationNodeType,
} from 'ui-modules';
import { SelectPos } from '@/pos/orders/components/selects/SelectPos';

/**
 * Answers a template's `sales:pos.pos`: the POS its orders are made in. The
 * answer is the POS id, the order action's `posId`.
 */
export const PosTemplateRequirement = ({
  kind,
  value,
  onChange,
}: AutomationTemplateRequirementProps) => {
  const { t } = useTranslation('sales');
  // `sales:pos.<what>`
  const [, , what] = splitAutomationNodeType(kind);

  if (what !== 'pos') {
    return null;
  }

  return (
    <SelectPos
      mode="single"
      value={typeof value === 'string' ? value : ''}
      onValueChange={(posId) =>
        onChange(typeof posId === 'string' && posId ? posId : null)
      }
      placeholder={t('select-pos')}
    />
  );
};
