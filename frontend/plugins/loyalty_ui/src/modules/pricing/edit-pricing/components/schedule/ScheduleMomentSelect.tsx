import { RadioGroup, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PricingScheduleMoment } from '@/pricing/types';
import { SCHEDULE_MOMENTS } from '@/pricing/utils/schedule';

interface ScheduleMomentSelectProps {
  value: PricingScheduleMoment;
  onChange: (value: PricingScheduleMoment) => void;
}

export const ScheduleMomentSelect = ({
  value,
  onChange,
}: ScheduleMomentSelectProps) => {
  const { t } = useTranslation('loyalty');

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{t('schedule-moment')}</p>
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as PricingScheduleMoment)}
        className="grid gap-2 sm:grid-cols-3"
      >
        {SCHEDULE_MOMENTS.map((moment) => (
          <label
            key={moment}
            htmlFor={`schedule-moment-${moment}`}
            className={cn(
              'flex items-start gap-3 p-3 border rounded-lg cursor-pointer',
              value === moment && 'border-primary bg-primary/5',
            )}
          >
            <RadioGroup.Item
              id={`schedule-moment-${moment}`}
              value={moment}
              aria-label={t(`schedule-moment-${moment}`)}
              className="mt-0.5"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">
                {t(`schedule-moment-${moment}`)}
              </span>
              <span className="block text-xs text-muted-foreground">
                {t(`schedule-moment-${moment}-example`)}
              </span>
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
};
