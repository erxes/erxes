import { useState } from 'react';
import { IconCalendarTime } from '@tabler/icons-react';
import { format, isValid, subDays, subMonths, subYears } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Combobox,
  Command,
  Dialog,
  Filter,
  Popover,
  useFilterContext,
  useFilterQueryState,
} from 'erxes-ui';
import { DateSelectVariant, SelectDateTicket } from './SelectDateTicket';

const relativeDateOptions = [
  { value: 'no-date', label: 'No date', getDate: () => 'no-date' },
  { value: 'in-past', label: 'In the past', getDate: () => 'in-past' },
  {
    value: '1-day',
    label: '1 day ago',
    getDate: () => subDays(new Date(), 1).toISOString(),
  },
  {
    value: '3-days',
    label: '3 days ago',
    getDate: () => subDays(new Date(), 3).toISOString(),
  },
  {
    value: '1-week',
    label: '1 week ago',
    getDate: () => subDays(new Date(), 7).toISOString(),
  },
  {
    value: '1-month',
    label: '1 month ago',
    getDate: () => subMonths(new Date(), 1).toISOString(),
  },
  {
    value: '3-months',
    label: '3 months ago',
    getDate: () => subMonths(new Date(), 3).toISOString(),
  },
  {
    value: '6-months',
    label: '6 months ago',
    getDate: () => subMonths(new Date(), 6).toISOString(),
  },
  {
    value: '1-year',
    label: '1 year ago',
    getDate: () => subYears(new Date(), 1).toISOString(),
  },
];

const CreatedDateContent = ({
  onClose,
  showNoDate = false,
}: {
  onClose: () => void;
  showNoDate?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const { sessionKey, setDialogView, setOpenDialog } = useFilterContext();
  const [value, setValue] = useFilterQueryState<string>(
    'createdDate',
    sessionKey,
  );

  return (
    <Command>
      <Command.List>
        {relativeDateOptions
          .filter((option) => showNoDate || option.value !== 'no-date')
          .map((option) => (
            <Command.Item
              key={option.value}
              value={option.value}
              onSelect={() => {
                setValue(option.getDate());
                onClose();
              }}
            >
              {t(option.value, option.label)}
              <Combobox.Check checked={value === option.value} />
            </Command.Item>
          ))}
        <Command.Separator />
        <Command.Item
          value="custom"
          onSelect={() => {
            onClose();
            setDialogView('createdDate');
            setOpenDialog(true);
          }}
        >
          {t('custom-date', 'Custom date')}
        </Command.Item>
      </Command.List>
    </Command>
  );
};

const CreatedDateFilterView = () => {
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey="createdDate">
      <CreatedDateContent onClose={resetFilterState} />
    </Filter.View>
  );
};

const CreatedDateFilterBar = () => {
  const { t } = useTranslation('frontline');
  const { sessionKey } = useFilterContext();
  const [value] = useFilterQueryState<string>('createdDate', sessionKey);
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : undefined;
  const label =
    value === 'in-past'
      ? t('in-past', 'In the past')
      : value === 'no-date'
      ? t('no-date', 'No date')
      : date && isValid(date)
      ? format(date, 'MMM d, yyyy')
      : value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Filter.BarButton filterKey="createdDate">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              {t('before', 'Before')}
            </span>
            <IconCalendarTime className="size-4" />
            <span className="font-medium">{label}</span>
          </div>
        </Filter.BarButton>
      </Popover.Trigger>
      <Combobox.Content>
        <CreatedDateContent onClose={() => setOpen(false)} showNoDate />
      </Combobox.Content>
    </Popover>
  );
};

const CreatedDateDialogContent = () => {
  const { t } = useTranslation('frontline');
  const { sessionKey, setOpenDialog } = useFilterContext();
  const [, setValue] = useFilterQueryState<string>('createdDate', sessionKey);
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>{t('custom-date', 'Custom date')}</Dialog.Title>
      </Dialog.Header>
      <SelectDateTicket.Provider
        value={date}
        onValueChange={setDate}
        variant={DateSelectVariant.FILTER}
      >
        <SelectDateTicket.Content />
      </SelectDateTicket.Provider>
      <Dialog.Footer>
        <Dialog.Close asChild>
          <Button variant="outline">{t('cancel', 'Cancel')}</Button>
        </Dialog.Close>
        <Button
          disabled={!date}
          onClick={() => {
            if (date) {
              setValue(date.toISOString());
              setOpenDialog(false);
            }
          }}
        >
          {t('apply', 'Apply')}
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  );
};

const CreatedDateFilterDialog = () => (
  <Filter.View filterKey="createdDate" inDialog>
    <CreatedDateDialogContent />
  </Filter.View>
);

export const SelectCreatedDateFilter = {
  FilterView: CreatedDateFilterView,
  FilterBar: CreatedDateFilterBar,
  Dialog: CreatedDateFilterDialog,
};
