import { useTranslation } from 'react-i18next';
import { Combobox } from 'erxes-ui/components/combobox';
import { Command } from 'erxes-ui/components/command';
import { useFormat } from 'erxes-ui/lib/format';
import { useFilterContext } from '../hooks/useFilterContext';
import {
  FIXED_DATES,
  type FixedDate,
  isFixedDate,
  isMonthToken,
  isYearToken,
  normalizeFixedDate,
  parseHalfToken,
  parseQuarterToken,
} from './dateTokens';

const usePresetLabels = (): Record<FixedDate, string> => {
  const { t } = useTranslation('ui', { keyPrefix: 'date-filter' });

  return {
    today: t('today', 'Today'),
    'in-the-past': t('in-the-past', 'In the past'),
    'last-1-day': t('last-1-day', 'Last 1 day'),
    'last-3-days': t('last-3-days', 'Last 3 days'),
    'last-7-days': t('last-7-days', 'Last 7 days'),
    'last-3-months': t('last-3-months', 'Last 3 months'),
  };
};

/** How a date filter's value reads on its bar: "Last 7 days", "2026 Q3", "Mar 1, 2026 - …". */
export const useDateFilterLabel = () => {
  const { t } = useTranslation('ui', { keyPrefix: 'date-filter' });
  const presets = usePresetLabels();
  const fmt = useFormat();

  return (raw: string) => {
    const value = normalizeFixedDate(raw);

    if (isFixedDate(value)) return presets[value];

    if (isMonthToken(value)) return value;

    const quarter = parseQuarterToken(value);

    if (quarter) return `${quarter.year} Q${quarter.quarter}`;

    const half = parseHalfToken(value);

    if (half) return `${half.year} H${half.half}`;

    if (isYearToken(value)) return value.replace('-y', '');

    if (value.includes(',')) {
      const [from = '', to = ''] = value.split(',');

      return `${fmt.date(from, 'MMM d, yyyy')} - ${fmt.date(to, 'MMM d, yyyy')}`;
    }

    return t('unknown', 'Unknown');
  };
};

/**
 * The presets of a date filter, and a last row that opens the dialog for a custom range.
 * `value` is the filter's key; its words come from `label`, else from the key.
 */
export const DateFilterCommand = ({
  value,
  selected,
  onSelect,
  focusOnMount,
  label,
}: {
  value: string;
  selected: string;
  onSelect: (value: string | null) => void;
  focusOnMount?: boolean;
  label?: string;
}) => {
  const { t } = useTranslation('ui', { keyPrefix: 'date-filter' });
  const { setDialogView, setOpenDialog } = useFilterContext();
  const presets = usePresetLabels();
  const fieldName = value.replace(/([A-Z])/g, ' $1').toLowerCase();
  const field = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  const selectedDate = normalizeFixedDate(selected);

  return (
    <Command>
      <Command.Input
        placeholder={label ?? t('field-date', '{{field}} date', { field })}
        focusOnMount={focusOnMount}
      />
      <Command.List>
        {FIXED_DATES.map((date) => (
          <Command.Item
            key={date}
            value={date}
            checked={selectedDate === date}
            onSelect={() => onSelect(date)}
          >
            {presets[date]}
            <Combobox.Check checked={selectedDate === date} />
          </Command.Item>
        ))}
        <Command.Item
          value="custom-date-or-timeframe"
          onSelect={() => {
            setDialogView(value);
            setOpenDialog(true);
          }}
        >
          {label
            ? t('custom-range', 'Custom {{label}} range', { label })
            : t('custom', 'Custom {{field}} date or timeframe', { field: fieldName })}
        </Command.Item>
      </Command.List>
    </Command>
  );
};
