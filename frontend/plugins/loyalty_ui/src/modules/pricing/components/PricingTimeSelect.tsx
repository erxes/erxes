import { parseTime } from '@internationalized/date';
import { DateInput, TimeField } from 'erxes-ui';

interface PricingTimeSelectProps {
  value?: string | null;
  onValueChange?: (value?: string | null) => void;
  'aria-label': string;
}

export const PricingTimeSelect = ({
  value,
  onValueChange,
  'aria-label': ariaLabel,
}: PricingTimeSelectProps) => (
  <TimeField
    value={value ? parseTime(value) : null}
    onChange={(nextValue) =>
      onValueChange?.(
        nextValue
          ? `${String(nextValue.hour).padStart(2, '0')}:${String(
              nextValue.minute,
            ).padStart(2, '0')}`
          : null,
      )
    }
    aria-label={ariaLabel}
    className="w-full"
  >
    <DateInput className="h-8" />
  </TimeField>
);
