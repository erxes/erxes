import { useState } from 'react';
import {
  Button,
  Calendar,
  Combobox,
  Command,
  Dialog,
  Filter,
  Switch,
  useQueryState,
  useFilterContext,
  DateInput,
  TimeField,
} from 'erxes-ui';
import { Time } from '@internationalized/date';
import dayjs from 'dayjs';
import { SelectBranches, SelectDepartments, SelectProduct } from 'ui-modules';
import {
  IconCalendar,
  IconFilter,
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

  return (
    <>
      {status && (
        <Filter.BarItem queryKey="status">
          <Filter.BarName>Status</Filter.BarName>
          <Filter.BarButton filterKey="status">{status}</Filter.BarButton>
        </Filter.BarItem>
      )}

      {branchId && (
        <SelectBranches.FilterBar
          mode="single"
          filterKey="branchId"
          label="Branch"
        />
      )}

      {departmentId && (
        <SelectDepartments.FilterBar
          mode="single"
          filterKey="departmentId"
          label="Department"
        />
      )}

      {productId && <SelectProduct.FilterBar queryKey="productId" />}

      {isPriority && (
        <Filter.BarItem queryKey="isPriority">
          <Filter.BarName>Priority</Filter.BarName>
          <Filter.BarButton filterKey="isPriority">
            {isPriority}
          </Filter.BarButton>
        </Filter.BarItem>
      )}

      {date && (
        <Filter.BarItem queryKey="date">
          <Filter.BarName>
            <IconCalendar size={16} />
            Date
          </Filter.BarName>
          <Filter.BarButton filterKey="date">
            {formatDateTime(date as string)}
          </Filter.BarButton>
        </Filter.BarItem>
      )}

      {isQuantityEnabled === true && (
        <Filter.BarItem queryKey="isQuantityEnabled">
          <Filter.BarName>Quantity Enabled</Filter.BarName>
          <Filter.BarButton filterKey="isQuantityEnabled">Yes</Filter.BarButton>
        </Filter.BarItem>
      )}

      {isPriceEnabled === true && (
        <Filter.BarItem queryKey="isPriceEnabled">
          <Filter.BarName>Price Enabled</Filter.BarName>
          <Filter.BarButton filterKey="isPriceEnabled">Yes</Filter.BarButton>
        </Filter.BarItem>
      )}

      {isExpiryEnabled === true && (
        <Filter.BarItem queryKey="isExpiryEnabled">
          <Filter.BarName>Expiry Enabled</Filter.BarName>
          <Filter.BarButton filterKey="isExpiryEnabled">Yes</Filter.BarButton>
        </Filter.BarItem>
      )}

      {isRepeatEnabled === true && (
        <Filter.BarItem queryKey="isRepeatEnabled">
          <Filter.BarName>Repeat Enabled</Filter.BarName>
          <Filter.BarButton filterKey="isRepeatEnabled">Yes</Filter.BarButton>
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
  return (
    <>
      <Filter.View>
        <Command>
          <Filter.CommandInput
            placeholder="Filter"
            variant="secondary"
            className="bg-background"
          />
          <Command.List className="p-1">
            <Filter.Item value="status">
              <IconFilter size={16} />
              Status
            </Filter.Item>
            <SelectBranches.FilterItem value="branchId" label="Branch" />
            <SelectDepartments.FilterItem
              value="departmentId"
              label="Department"
            />
            <Filter.Item value="productId">
              <IconShoppingCart size={16} />
              Product
            </Filter.Item>
            <Command.Separator className="my-1" />
            <Filter.Item value="isPriority">
              <IconFilter size={16} />
              Prioritize Rule
            </Filter.Item>
            <Filter.Item value="date" inDialog>
              <IconCalendar size={16} />
              Date
            </Filter.Item>
            <Command.Separator className="my-1" />
            <BooleanFilterCheckbox
              filterKey="isQuantityEnabled"
              label="Quantity Enabled"
            />
            <BooleanFilterCheckbox
              filterKey="isPriceEnabled"
              label="Price Enabled"
            />
            <BooleanFilterCheckbox
              filterKey="isExpiryEnabled"
              label="Expiry Enabled"
            />
            <BooleanFilterCheckbox
              filterKey="isRepeatEnabled"
              label="Repeat Enabled"
            />
          </Command.List>
        </Command>
      </Filter.View>
      <SelectBranches.FilterView mode="single" filterKey="branchId" />
      <SelectDepartments.FilterView mode="single" filterKey="departmentId" />
      <SelectProduct.FilterView queryKey="productId" />
      <Filter.View filterKey="status">
        <StatusFilterContent />
      </Filter.View>
      <Filter.View filterKey="isPriority">
        <PriorityFilterContent />
      </Filter.View>
    </>
  );
};

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'Draft', value: 'draft' },
  { label: 'Completed', value: 'completed' },
];

const StatusFilterContent = () => {
  const [status, setStatus] = useQueryState<string>('status');
  const { resetFilterState } = useFilterContext();

  return (
    <Command>
      <Command.Input placeholder="Search status" />
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
            {option.label}
            <Combobox.Check checked={status === option.value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

export const SingleDateTimeDialogContent = () => {
  const [date, setDate] = useQueryState<string>('date');
  const { resetFilterState } = useFilterContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    date ? dayjs(date, 'YYYY-MM-DD HH:mm').toDate() : undefined,
  );
  const [selectedTime, setSelectedTime] = useState<Time | null>(
    date
      ? new Time(
          dayjs(date, 'YYYY-MM-DD HH:mm').hour(),
          dayjs(date, 'YYYY-MM-DD HH:mm').minute(),
        )
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
    <Dialog.Content className="max-w-sm">
      <Dialog.Header className="pb-2">
        <Dialog.Title className="text-lg font-semibold">
          Select Date & Time
        </Dialog.Title>
      </Dialog.Header>
      <div className="py-2 space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => setSelectedDate(d as Date)}
        />
        <div className="px-2 space-y-2">
          <div className="flex gap-2 items-center p-3">
            <IconCalendar size={18} className="text-muted-foreground" />
            <TimeField
              value={selectedTime}
              onChange={setSelectedTime}
              aria-label="Time"
              className="flex-1"
            >
              <DateInput />
            </TimeField>
          </div>
        </div>
      </div>
      <Dialog.Footer className="gap-2 pt-4 border-t">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleApply}>Apply</Button>
      </Dialog.Footer>
    </Dialog.Content>
  );
};

const PRIORITY_OPTIONS = [
  { label: 'only', value: 'only' },
  { label: 'exclude', value: 'exclude' },
];

const PriorityFilterContent = () => {
  const [isPriority, setIsPriority] = useQueryState<string>('isPriority');
  const { resetFilterState } = useFilterContext();

  return (
    <Command>
      <Command.Input placeholder="Search priority" />
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
            {option.label}
            <Combobox.Check checked={isPriority === option.value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
