import { usePricing } from '@/pricing/hooks/usePricing';
import { cn, Combobox, Command, Popover, TextOverflowTooltip } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SelectPricingProps {
  value?: string;
  onValueChange: (pricingId: string) => void;
  className?: string;
}

export const SelectPricing = ({
  value,
  onValueChange,
  className,
}: SelectPricingProps) => {
  const { t } = useTranslation('loyalty');
  const { pricing, loading } = usePricing();
  const [open, setOpen] = useState(false);

  const selectedPricing = pricing.find(
    (pricingPlan) => pricingPlan._id === value,
  );

  const handleSelect = (pricingId: string) => {
    setOpen(false);
    onValueChange(pricingId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger
        className={cn('h-7 w-40', className)}
        disabled={loading}
        aria-label={t('select-pricing')}
      >
        {loading ? (
          <Combobox.Value loading />
        ) : (
          <TextOverflowTooltip
            value={selectedPricing?.name || t('select-pricing')}
            className={selectedPricing ? 'min-w-0' : 'text-accent-foreground'}
          />
        )}
      </Combobox.Trigger>

      <Combobox.Content>
        <Command>
          <Command.Input focusOnMount placeholder={t('search-pricing')} />
          <Command.Empty>{t('no-pricing-found')}</Command.Empty>
          <Command.List>
            {pricing.map((pricingPlan) => (
              <Command.Item
                key={pricingPlan._id}
                value={pricingPlan._id}
                keywords={[pricingPlan.name]}
                onSelect={() => handleSelect(pricingPlan._id)}
              >
                <TextOverflowTooltip
                  value={pricingPlan.name}
                  className="min-w-0 flex-1"
                />
                <Combobox.Check checked={pricingPlan._id === value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
