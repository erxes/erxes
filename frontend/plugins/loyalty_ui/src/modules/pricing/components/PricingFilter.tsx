import React, { useState } from 'react';
import {
  Button,
  Calendar,
  Combobox,
  Command,
  Filter,
  Switch,
  useQueryState,
  useFilterContext,
  DateInput,
  TimeField,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Time } from '@internationalized/date';
import dayjs from 'dayjs';
import { SelectBranches, SelectDepartments, SelectProduct } from 'ui-modules';
import {
  IconCalendar,
  IconFilter,
  IconHierarchy,
  IconShoppingCart,
} from '@tabler/icons-react';

const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  return dayjs(dateString, 'YYYY-MM-DD HH:mm').format('MMM DD, YYYY HH:mm');
};

type PricingFilterState = {
  searchValue?: string | null;
  status?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
  productId?: string | null;
  isPriority?: string | null;
  date?: string | null;
  isQuantityEnabled?: boolean | null;
  isPriceEnabled?: boolean | null;
  isExpiryEnabled?: boolean | null;
  isRepeatEnabled?: boolean | null;
  [key: string]: string | boolean | null | undefined;
};

export const PricingFilterBar = ({
  queries,
}: {
  queries: PricingFilterState;
}) => {
  const { t } = useTranslation('loyalty');
  const {
    status,
    branchId,
    departmentId,
    productId,
    isPriority,
    date,
    isQuantityEnabled,
    isPriceEnabled,
    isExpiryEnabled,
    isRepeatEnabled,
  } = queries || {};

  const displayStatus = status || 'active';

  return (
    <>
      <Filter.BarItem queryKey="status">
        <Filter.BarName>{t('status')}</Filter.BarName>
        <Filter.BarButton filterKey="status">{displayStatus}</Filter.BarButton>
      </Filter.BarItem>

      {branchId && (
        <SelectBranches.FilterBar
          mode="single"
          filterKey="branchId"
          label={t('branch')}
        />
      )}

      {departmentId && (
        <SelectDepartments.FilterBar
          mode="single"
          filterKey="departmentId"
          label={t('department')}
        />
      )}

      {productId && (
        <SelectProduct.FilterBar filterKey="productId" label={t('product')} />
      )}

      {isPriority && (
        <Filter.BarItem queryKey="isPriority">
          <Filter.BarName>{t('priority')}</Filter.BarName>
          <Filter.BarButton filterKey="isPriority">
            {isPriority}
          </Filter.BarButton>
        </Filter.BarItem>
      )}

      {date && (
        <Filter.BarItem queryKey="date">
          <Filter.BarName>
            <IconCalendar size={16} />
            {t('date')}
          </Filter.BarName>
          <Filter.BarButton filterKey="date">
            {formatDateTime(date as string)}
          </Filter.BarButton>
        </Filter.BarItem>
      )}

      {isQuantityEnabled === true && (
        <Filter.BarItem queryKey="isQuantityEnabled">
          <Filter.BarName>{t('quantity-enabled')}</Filter.BarName>
          <Filter.BarButton filterKey="isQuantityEnabled">{t('yes')}</Filter.BarButton>
        </Filter.BarItem>
      )}

      {isPriceEnabled === true && (
        <Filter.BarItem queryKey="isPriceEnabled">
          <Filter.BarName>{t('price-enabled')}</Filter.BarName>
          <Filter.BarButton filterKey="isPriceEnabled">{t('yes')}</Filter.BarButton>
        </Filter.BarItem>
      )}

      {isExpiryEnabled === true && (
        <Filter.BarItem queryKey="isExpiryEnabled">
          <Filter.BarName>{t('expiry-enabled')}</Filter.BarName>
          <Filter.BarButton filterKey="isExpiryEnabled">{t('yes')}</Filter.BarButton>
        </Filter.BarItem>
      )}

      {isRepeatEnabled === true && (
        <Filter.BarItem queryKey="isRepeatEnabled">
          <Filter.BarName>{t('repeat-enabled')}</Filter.BarName>
          <Filter.BarButton filterKey="isRepeatEnabled">{t('yes')}</Filter.BarButton>
        </Filter.BarItem>
      )}
    </>
  );
};

const BooleanFilterCheckbox = ({
  filterKey,
  label,
}: {
  filterKey: string;
  label: string;
}) => {
  const [value, setValue] = useQueryState<boolean>(filterKey);
  const { resetFilterState } = useFilterContext();
  const isChecked = value === true;

  return (
    <div
      className="relative flex cursor-pointer select-none items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setValue(isChecked ? null : true);
        resetFilterState();
      }}
    >
      {label}
      <Switch checked={isChecked} className="pointer-events-none" />
    </div>
  );
};

export const PricingFilterView = () => {
  const { t } = useTranslation('loyalty');
  return (
    <>
      <Filter.View>
        <Command>
          <Filter.CommandInput
            placeholder={t('filter')}
            variant="secondary"
            className="bg-background"
          />
          <Command.List className="p-1">
            <Filter.Item value="status">
              <IconHierarchy size={16} />
              {t('status')}
            </Filter.Item>
            <SelectBranches.FilterItem value="branchId" label={t('branch')} />
            <SelectDepartments.FilterItem
              value="departmentId"
              label={t('department')}
            />
            <Filter.Item value="productId">
              <IconShoppingCart size={16} />
              {t('product')}
            </Filter.Item>
            <Command.Separator className="my-1" />
            <Filter.Item value="isPriority">
              <IconFilter size={16} />
              {t('prioritize-rule')}
            </Filter.Item>
            <Filter.Item value="date">
              <IconCalendar size={16} />
              {t('date')}
            </Filter.Item>
            <Command.Separator className="my-1" />
            <BooleanFilterCheckbox
              filterKey="isQuantityEnabled"
              label={t('quantity-enabled')}
            />
            <BooleanFilterCheckbox
              filterKey="isPriceEnabled"
              label={t('price-enabled')}
            />
            <BooleanFilterCheckbox
              filterKey="isExpiryEnabled"
              label={t('expiry-enabled')}
            />
            <BooleanFilterCheckbox
              filterKey="isRepeatEnabled"
              label={t('repeat-enabled')}
            />
          </Command.List>
        </Command>
      </Filter.View>
      <SelectBranches.FilterView mode="single" filterKey="branchId" />
      <SelectDepartments.FilterView mode="single" filterKey="departmentId" />
      <SelectProduct.FilterView filterKey="productId" />
      <Filter.View filterKey="status">
        <StatusFilterContent />
      </Filter.View>
      <Filter.View filterKey="isPriority">
        <PriorityFilterContent />
      </Filter.View>
      <DateFilterView />
    </>
  );
};

const STATUS_OPTIONS = [
  { label: 'active', value: 'active' },
  { label: 'archived', value: 'archived' },
  { label: 'draft', value: 'draft' },
  { label: 'completed', value: 'completed' },
];

const StatusFilterContent = () => {
  const { t } = useTranslation('loyalty');
  const [status, setStatus] = useQueryState<string>('status');
  const { resetFilterState } = useFilterContext();

  return (
    <Command>
      <Command.Input placeholder={t('search-status')} />
      <Command.List>
        {STATUS_OPTIONS.map((option) => (
          <Command.Item
            key={option.value}
            value={option.value}
            onSelect={() => {
              setStatus(option.value);
              resetFilterState();
            }}
          >
            {t(option.label)}
            <Combobox.Check checked={status === option.value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

interface DateFilterContextType {
  selectedDate?: Date;
  selectedTime: Time | null;
  onDateChange: (date?: Date) => void;
  onTimeChange: (time: Time | null) => void;
  onApply: () => void;
  onCancel: () => void;
}

const DateFilterContext = React.createContext<DateFilterContextType | null>(
  null,
);

const useDateFilterContext = () => {
  const context = React.useContext(DateFilterContext);
  if (!context) {
    throw new Error(
      'useDateFilterContext must be used within DateFilterProvider',
    );
  }
  return context;
};

const DateFilterContent = () => {
  const { t } = useTranslation('loyalty');
  const {
    selectedDate,
    selectedTime,
    onDateChange,
    onTimeChange,
    onApply,
    onCancel,
  } = useDateFilterContext();

  return (
    <>
      <div className="py-2 space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateChange}
          defaultMonth={selectedDate}
        />

        <div className="px-2 space-y-2">
          <div className="flex gap-2 items-center p-3">
            <TimeField
              value={selectedTime}
              onChange={onTimeChange}
              aria-label={t('time')}
              className="flex-1"
            >
              <DateInput />
            </TimeField>
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end px-2 py-2 border-t">
        <Button variant="outline" size="sm" onClick={onCancel}>
          {t('cancel')}
        </Button>

        <Button size="sm" onClick={onApply}>
          {t('apply')}
        </Button>
      </div>
    </>
  );
};

const DateFilterView = () => {
  const [date, setDate] = useQueryState<string>('date');
  const { resetFilterState } = useFilterContext();

  const parsedDate = date ? dayjs(date, 'YYYY-MM-DD HH:mm') : null;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    parsedDate?.isValid() ? parsedDate.toDate() : undefined,
  );
  const [selectedTime, setSelectedTime] = useState<Time | null>(
    parsedDate?.isValid()
      ? new Time(parsedDate.hour(), parsedDate.minute())
      : new Time(0, 0),
  );

  const handleApply = () => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const hour = selectedTime
        ? String(selectedTime.hour).padStart(2, '0')
        : '00';
      const minute = selectedTime
        ? String(selectedTime.minute).padStart(2, '0')
        : '00';
      const formattedDate = `${year}-${month}-${day} ${hour}:${minute}`;
      setDate(formattedDate);
      resetFilterState();
    }
  };

  const handleCancel = () => {
    resetFilterState();
  };

  return (
    <DateFilterContext.Provider
      value={{
        selectedDate,
        selectedTime,
        onDateChange: setSelectedDate,
        onTimeChange: setSelectedTime,
        onApply: handleApply,
        onCancel: handleCancel,
      }}
    >
      <Filter.View filterKey="date">
        <DateFilterContent />
      </Filter.View>
    </DateFilterContext.Provider>
  );
};

const PRIORITY_OPTIONS = [
  { label: 'only', value: 'only' },
  { label: 'exclude', value: 'exclude' },
];

const PriorityFilterContent = () => {
  const { t } = useTranslation('loyalty');
  const [isPriority, setIsPriority] = useQueryState<string>('isPriority');
  const { resetFilterState } = useFilterContext();

  return (
    <Command>
      <Command.Input placeholder={t('search-priority')} />
      <Command.List>
        {PRIORITY_OPTIONS.map((option) => (
          <Command.Item
            key={option.value}
            value={option.value}
            onSelect={() => {
              setIsPriority(option.value);
              resetFilterState();
            }}
          >
            {t(option.label)}
            <Combobox.Check checked={isPriority === option.value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
