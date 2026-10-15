import { Command, Filter, DatePicker, useFilterContext } from 'erxes-ui';
import { IconCalendar, IconCheck } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { IField } from 'ui-modules';
import type { TicketPropertyFilter } from '@/report/types';
import { toggleFilterValue } from '@/ticket/utils/filterValues';
import { getDateRange } from '@/report/utils/dateFilters';
import { ReportDateFilter } from '../ReportDateFilter';
import {
  getPropertyFilterLabel,
  getPropertyFilterValues,
  setPropertyFilterValues,
  clearPropertyFilter,
  getLocalDateFromFilterValue,
  getPropertyDateRangeValue,
} from '@/report/utils/ticketPropertyFilters';

interface PropertyValueFilterProps {
  field: IField;
  value: TicketPropertyFilter[];
  onValueChange: (value: TicketPropertyFilter[]) => void;
  onClose?: () => void;
}

export const PropertyFilterView = ({
  value,
  onValueChange,
  fields,
  loading,
}: {
  value: TicketPropertyFilter[];
  onValueChange: (value: TicketPropertyFilter[]) => void;
  fields: IField[];
  loading: boolean;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      {loading ? (
        <Command.Empty>{t('loading', 'Loading...')}</Command.Empty>
      ) : (
        <>
          <Command.Item value="all" onSelect={() => onValueChange([])}>
            <div className="flex items-center gap-2">
              {(!value || value.length === 0) && (
                <IconCheck className="size-4" />
              )}
              <span>{t('all-properties', 'All Properties')}</span>
            </div>
          </Command.Item>
          {fields.length === 0 && (
            <Command.Empty>
              {t('no-custom-properties-found', 'No custom properties found.')}
            </Command.Empty>
          )}
          {fields.map((field) => (
            <Filter.Item key={field._id} value={`property:${field._id}`}>
              <div className="flex w-full items-center justify-between gap-3">
                <span className="truncate">{field.name}</span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {getPropertyFilterLabel(value, field)}
                </span>
              </div>
            </Filter.Item>
          ))}
        </>
      )}
    </Command.List>
  );
};

export const GroupByFilterView = ({
  value,
  onValueChange,
  fields,
  loading,
}: {
  value: string;
  onValueChange: (value: string) => void;
  fields: IField[];
  loading: boolean;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      {loading ? (
        <Command.Empty>{t('loading', 'Loading...')}</Command.Empty>
      ) : (
        <>
          <Command.Item value="none" onSelect={() => onValueChange('')}>
            <div className="flex items-center gap-2">
              {!value && <IconCheck className="size-4" />}
              <span>{t('no-grouping', 'No grouping')}</span>
            </div>
          </Command.Item>
          {fields.length === 0 && (
            <Command.Empty>
              {t('no-custom-properties-found', 'No custom properties found.')}
            </Command.Empty>
          )}
          {fields.map((field) => (
            <Command.Item
              key={field._id}
              value={field._id}
              onSelect={() =>
                onValueChange(value === field._id ? '' : field._id)
              }
            >
              <div className="flex items-center gap-2">
                {value === field._id && <IconCheck className="size-4" />}
                <span className="truncate">{field.name}</span>
              </div>
            </Command.Item>
          ))}
        </>
      )}
    </Command.List>
  );
};

export const PropertyValueFilterView = ({
  field,
  value,
  onValueChange,
  onClose,
}: PropertyValueFilterProps) => {
  const { t } = useTranslation('frontline');
  if (field.type === 'date') {
    return (
      <PropertyDateFilter
        field={field}
        value={value}
        onValueChange={onValueChange}
        onClose={onClose}
      />
    );
  }

  const selectedValues = getPropertyFilterValues(value, field._id);
  const options = field.options || [];

  const handleValueSelect = (optionValue: string) => {
    const isSelected = selectedValues.includes(optionValue);
    const supportsMultipleValues =
      field.type === 'select' ||
      field.type === 'multiSelect' ||
      field.type === 'radio';
    let nextValues: string[];

    if (supportsMultipleValues) {
      nextValues = toggleFilterValue(selectedValues, optionValue);
    } else {
      nextValues = isSelected ? [] : [optionValue];
    }

    if (!nextValues.length) {
      onValueChange(clearPropertyFilter(value, field._id));
      return;
    }

    onValueChange(
      setPropertyFilterValues({ filters: value, field, values: nextValues }),
    );
  };

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      {options.length === 0 && (
        <Command.Empty>
          {t('no-options-found', 'No options found.')}
        </Command.Empty>
      )}
      {options.map((option) => (
        <Command.Item
          key={option.value}
          value={option.value}
          onSelect={() => handleValueSelect(option.value)}
        >
          <div className="flex items-center gap-2">
            {selectedValues.includes(option.value) && (
              <IconCheck className="size-4" />
            )}
            <span>{option.label || option.value}</span>
          </div>
        </Command.Item>
      ))}
      <Command.Separator />
      <Command.Item
        value={`${field._id}:clear`}
        onSelect={() => onValueChange(clearPropertyFilter(value, field._id))}
        className="text-destructive"
      >
        {t('clear-property', 'Clear property')}
      </Command.Item>
    </Command.List>
  );
};

const PropertyDateFilter = ({
  field,
  value,
  onValueChange,
  onClose,
}: PropertyValueFilterProps) => {
  const { t } = useTranslation('frontline');
  const { setDialogView, setOpenDialog, setOpen } = useFilterContext();
  const selectedValues = getPropertyFilterValues(value, field._id);
  const selectedValue = selectedValues[0];
  const selectedDate =
    selectedValue && selectedValues.length === 1
      ? getLocalDateFromFilterValue(selectedValue)
      : undefined;
  const rangeLabel =
    selectedValues.length > 1
      ? `${selectedValues[0]} - ${selectedValues[1]}`
      : 'Custom range...';

  const openRangeDialog = () => {
    onClose?.();
    setDialogView(`property-date-range:${field._id}`);
    setOpenDialog(true);
    setOpen(false);
  };

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      <div className="space-y-3 px-2 py-2">
        <div className="space-y-1.5">
          <div className="text-muted-foreground px-1 text-xs font-medium">
            {t('exact-date', 'Exact date')}
          </div>
          <DatePicker
            value={selectedDate}
            onChange={(date) => {
              if (date instanceof Date) {
                onValueChange(
                  setPropertyFilterValues({
                    filters: value,
                    field,
                    values: [format(date, 'yyyy-MM-dd')],
                  }),
                );
              }
            }}
            mode="single"
            format="MMM D, YYYY"
            placeholder={t('select-exact-date', 'Select exact date')}
            className="w-full"
            defaultMonth={selectedDate || new Date()}
          />
        </div>
        <Command.Item value={`${field._id}:range`} onSelect={openRangeDialog}>
          <IconCalendar className="size-4" />
          {rangeLabel}
        </Command.Item>
      </div>
      <Command.Separator />
      <Command.Item
        value={`${field._id}:clear`}
        onSelect={() => onValueChange(clearPropertyFilter(value, field._id))}
        className="text-destructive"
      >
        {t('clear-property', 'Clear property')}
      </Command.Item>
    </Command.List>
  );
};

export const PropertyDateRangeFilter = ({
  field,
  value,
  onValueChange,
}: Omit<PropertyValueFilterProps, 'onClose'>) => {
  const selectedValues = getPropertyFilterValues(value, field._id);

  const handleChange = (dateValue: string) => {
    const { fromDate, toDate } = getDateRange(dateValue);

    if (!fromDate || !toDate) {
      return;
    }

    onValueChange(
      setPropertyFilterValues({
        filters: value,
        field,
        values: [format(fromDate, 'yyyy-MM-dd'), format(toDate, 'yyyy-MM-dd')],
      }),
    );
  };

  return (
    <ReportDateFilter
      value={getPropertyDateRangeValue(selectedValues)}
      onChange={handleChange}
    />
  );
};
