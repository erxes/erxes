import { Combobox, Command } from 'erxes-ui/components';
import { FIXED_DATES } from '../constants/dateTypes';
import { cn } from 'erxes-ui/lib/utils';
import { normalizeFixedDate } from '../utils/dateTokens';
import { getDisplayValue } from '../utils/getDisplayValue';
import { useFilterContext } from '../../hooks/useFilterContext';

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
  const { setDialogView, setOpenDialog } = useFilterContext();
  const fieldName = value.replace(/([A-Z])/g, ' $1').toLowerCase();
  const displayLabel = label ?? fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' date';
  const selectedDate = normalizeFixedDate(selected);

  return (
    <Command>
      <Command.Input placeholder={displayLabel} focusOnMount={focusOnMount} />
      <Command.List>
        {FIXED_DATES.map((date) => (
          <Command.Item
            key={date}
            value={date}
            onSelect={() => {
              onSelect(date);
            }}
            className={cn('h-8', selectedDate === date && 'text-primary')}
          >
            {getDisplayValue(date)}
            <Combobox.Check checked={selectedDate === date} className="text-primary" />
          </Command.Item>
        ))}
        <Command.Item
          className="h-8"
          value="custom-date-or-timeframe"
          onSelect={() => {
            setDialogView(value);
            setOpenDialog(true);
          }}
        >
          {label ? `Custom ${label} range` : `Custom ${fieldName} date or timeframe`}
        </Command.Item>
      </Command.List>
    </Command>
  );
};
