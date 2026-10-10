import { Combobox, Command, cn, useFilterContext } from 'erxes-ui';
import { IconCalendar } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { getReportDisplayValue, REPORT_FIXED_DATES } from './ReportDateFilter';

export const ReportDateFilterMenu = ({
  filterKey,
  selected,
  onSelect,
  onClose,
  label,
}: {
  filterKey: string;
  selected?: string;
  onSelect?: (value: string) => void;
  onClose?: () => void;
  label?: string;
}) => {
  const { t } = useTranslation('frontline');
  const { setDialogView, setOpenDialog, setOpen } = useFilterContext();

  const isCustomDate = selected && !REPORT_FIXED_DATES.includes(selected);

  const handleCustomRange = () => {
    onClose?.();
    setDialogView(filterKey);
    setOpenDialog(true);
    setOpen(false);
  };

  return (
    <Command>
      <Command.Input
        placeholder={label || t('search-date', 'Search date')}
        focusOnMount
      />
      <Command.List>
        {REPORT_FIXED_DATES.map((date) => (
          <Command.Item
            key={date}
            value={date}
            onSelect={() => onSelect?.(date)}
            className={cn('h-8', selected === date && 'text-primary')}
          >
            {getReportDisplayValue(date)}
            <Combobox.Check
              checked={selected === date}
              className="text-primary"
            />
          </Command.Item>
        ))}
        <Command.Separator className="my-1" />
        <Command.Item
          value="custom-range"
          onSelect={handleCustomRange}
          className={cn('h-8', isCustomDate && 'text-primary')}
        >
          <IconCalendar className="size-4" />
          {isCustomDate
            ? getReportDisplayValue(selected)
            : t('custom-range', 'Custom Range...')}
        </Command.Item>
      </Command.List>
    </Command>
  );
};
