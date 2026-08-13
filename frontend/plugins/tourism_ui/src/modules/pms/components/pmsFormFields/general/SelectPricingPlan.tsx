import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Combobox,
  Command,
  PopoverScoped,
  TextOverflowTooltip,
} from 'erxes-ui';
import {
  IPmsPricingPlan,
  usePmsPricingPlans,
} from '@/pms/hooks/usePmsPricingPlans';

export const SelectPricingPlan = ({
  value,
  onValueChange,
  placeholder,
  disabled,
}: {
  value?: string;
  onValueChange: (pricingPlan: IPmsPricingPlan) => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('tourism');
  const { pricingPlans, loading, error } = usePmsPricingPlans();
  const [open, setOpen] = useState(false);

  const selectedPlan = pricingPlans.find(
    (pricingPlan) => pricingPlan._id === value,
  );

  const handleSelect = (pricingPlan: IPmsPricingPlan) => {
    onValueChange(pricingPlan);
    setOpen(false);
  };

  const emptyMessage = loading
    ? t('loading-pricing-plans')
    : error
      ? t('failed-to-load-pricing-plans')
      : t('no-pricing-plans-found');

  const renderTriggerValue = () => {
    if (selectedPlan) {
      return <TextOverflowTooltip value={selectedPlan.name} className="max-w-40" />;
    }

    if (value && loading) {
      return (
        <span className="text-accent-foreground/80">
          {t('loading-pricing-plans')}
        </span>
      );
    }

    return (
      <span className="text-accent-foreground/80">
        {placeholder || t('select-pricing-plan')}
      </span>
    );
  };

  return (
    <PopoverScoped open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className="w-full h-8" disabled={disabled}>
        {renderTriggerValue()}
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input focusOnMount placeholder={t('search-pricing-plan')} />
          <Command.List>
            <Command.Empty>
              <div className="text-muted-foreground">{emptyMessage}</div>
            </Command.Empty>
            {pricingPlans.map((pricingPlan) => (
              <Command.Item
                key={pricingPlan._id}
                value={pricingPlan._id}
                keywords={[pricingPlan.name]}
                onSelect={() => handleSelect(pricingPlan)}
              >
                <div className="flex overflow-hidden flex-1 gap-2 items-center">
                  <TextOverflowTooltip value={pricingPlan.name} />
                </div>
                <Combobox.Check checked={value === pricingPlan._id} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </PopoverScoped>
  );
};
