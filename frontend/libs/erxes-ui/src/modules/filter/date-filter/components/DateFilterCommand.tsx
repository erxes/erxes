import { Combobox, Command } from 'erxes-ui/components';
import { FIXED_DATES } from '../constants/dateTypes';
import { cn } from 'erxes-ui/lib/utils';
import { getDisplayValue } from '../utils/getDisplayValue';
import { useFilterContext } from '../../hooks/useFilterContext';

export const DateFilterCommand = ({
  value,
  selected,
  onSelect,
  focusOnMount,
}: {
  value: string;
  selected: string;
  onSelect: (value: string | null) => void;
  focusOnMount?: boolean;
}) => {
  const { setDialogView, setOpenDialog } = useFilterContext();
  return (
    <Command>
      <Command.Input
        placeholder={value.charAt(0).toUpperCase() + value.slice(1) + ' date'}
        focusOnMount={focusOnMount}
      />
      <Command.List>
        {FIXED_DATES.map((date) => (
          <Command.Item
            key={date}
            value={date}
            onSelect={() => {
              onSelect(date);
            }}
            className={cn('h-8', selected === date && 'text-primary')}
          >
            {getDisplayValue(date)}
            <Combobox.Check
              checked={selected === date}
              className="text-primary"
            />
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
          Custom {value} date or timeframe
        </Command.Item>
      </Command.List>
    </Command>
  );
};
