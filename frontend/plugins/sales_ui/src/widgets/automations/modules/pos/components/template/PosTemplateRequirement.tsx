import { IconBuildingStore, IconPlus } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  AutomationTemplateRequirementProps,
  splitAutomationNodeType,
  TemplateRequirementOptions,
} from 'ui-modules';
import { PosCreate } from '@/pos/components/pos-create';
import { SelectPos } from '@/pos/orders/components/selects/SelectPos';
import { usePosTemplateRequirement } from '~/widgets/automations/modules/pos/components/template/usePosTemplateRequirement';

/**
 * Answers a template's `sales:pos.pos`: the POS its orders are made in. The
 * answer is the POS id, the order action's `posId`.
 */
export const PosTemplateRequirement = ({
  kind,
  value,
  onChange,
  onLabel,
}: AutomationTemplateRequirementProps) => {
  const { t } = useTranslation('sales');
  const { posId, options, loading, showCards, isCreating, setCreating, select } =
    usePosTemplateRequirement(value, onChange, onLabel);
  // `sales:pos.<what>`
  const [, , what] = splitAutomationNodeType(kind);

  if (what !== 'pos') {
    return null;
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      {showCards ? (
        <TemplateRequirementOptions
          options={options.map((option) => ({
            ...option,
            icon: <IconBuildingStore className="size-4" />,
          }))}
          value={posId}
          onSelect={select}
          createLabel={t('pos-create')}
          onCreate={() => setCreating(true)}
        />
      ) : (
        <div className="flex flex-col items-start gap-2">
          <SelectPos
            mode="single"
            value={posId}
            onValueChange={(next) =>
              select(typeof next === 'string' ? next : undefined)
            }
            placeholder={t('select-pos')}
          />
          <Button variant="ghost" size="sm" onClick={() => setCreating(true)}>
            <IconPlus />
            {t('pos-create')}
          </Button>
        </div>
      )}
      <PosCreate
        open={isCreating}
        onOpenChange={setCreating}
        onCreateSuccess={select}
      />
    </>
  );
};
