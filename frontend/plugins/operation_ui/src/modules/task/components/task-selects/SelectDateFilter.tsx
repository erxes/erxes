import { useState } from 'react';
import {
  Command,
  Filter,
  Popover,
  useFilterContext,
  useQueryState,
  Button,
  Calendar,
  Dialog,
} from 'erxes-ui';
import {
  IconCalendar,
  IconCalendarTime,
  IconCheck,
} from '@tabler/icons-react';
import {
  format,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';

export enum DateFilterType {
  DUE_DATE = 'targetDate',
  CREATED_DATE = 'createdDate',
  UPDATED_DATE = 'updatedDate',
  STARTED_DATE = 'startDate',
  COMPLETED_DATE = 'completedDate',
}

interface DateFilterOption {
  value: string;
  label: string;
  getDate?: () => Date;
}

const relativeDateOptions: DateFilterOption[] = [
  { value: 'no-date', label: 'No date' },
  { value: 'in-past', label: 'In the past' },
  { value: '1-day', label: '1 day ago', getDate: () => subDays(new Date(), 1) },
  { value: '3-days', label: '3 days ago', getDate: () => subDays(new Date(), 3) },
  { value: '1-week', label: '1 week ago', getDate: () => subDays(new Date(), 7) },
  { value: '1-month', label: '1 month ago', getDate: () => subMonths(new Date(), 1) },
  { value: '3-months', label: '3 months ago', getDate: () => subMonths(new Date(), 3) },
  { value: '6-months', label: '6 months ago', getDate: () => subMonths(new Date(), 6) },
  { value: '1-year', label: '1 year ago', getDate: () => subYears(new Date(), 1) },
];

const getDateLabel = (value: string | null): string => {
  if (!value) return '';
  
  const option = relativeDateOptions.find(opt => opt.value === value);
  if (option) return option.label;
  
  try {
    const date = new Date(value);
    return format(date, 'MMM d, yyyy');
  } catch {
    return value;
  }
};

const CustomDateDialog = ({
  open,
  onOpenChange,
  onSelectDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDate: (date: Date) => void;
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleApply = () => {
    if (selectedDate) {
      onSelectDate(selectedDate);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="sm:max-w-[425px]">
        <Dialog.Header>
          <Dialog.Title>Select custom date</Dialog.Title>
        </Dialog.Header>
        <div className="py-4 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            initialFocus
          />
        </div>
        <Dialog.Footer className="sm:space-x-3">
          <Dialog.Close asChild>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Dialog.Close>
          <Button size="lg" onClick={handleApply} disabled={!selectedDate}>
            Apply
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

interface SelectDateFilterProps {
  filterKey: string;
  dateType: DateFilterType;
  label: string;
  icon?: React.ReactNode;
  showNoDueDate?: boolean;
}

const SelectDateFilterView = ({
  filterKey,
  dateType,
  label,
  showNoDueDate = false,
}: SelectDateFilterProps) => {
  const [dateValue, setDateValue] = useQueryState<string>(filterKey);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const { resetFilterState } = useFilterContext();

  const handleSelect = (value: string) => {
    const option = relativeDateOptions.find(opt => opt.value === value);
    if (option?.getDate) {
      setDateValue(option.getDate().toISOString());
    } else {
      setDateValue(value);
    }
    resetFilterState();
  };

  const handleCustomDate = (date: Date) => {
    setDateValue(date.toISOString());
    resetFilterState();
  };

  const displayOptions = showNoDueDate 
    ? relativeDateOptions 
    : relativeDateOptions.filter(opt => opt.value !== 'no-date');

  return (
    <Filter.View filterKey={filterKey}>
      <Command>
        <Command.List>
          {displayOptions.map((option) => (
            <Command.Item
              key={option.value}
              value={option.value}
              onSelect={() => handleSelect(option.value)}
            >
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {dateValue === option.value && (
                  <IconCheck className="w-4 h-4 text-primary" />
                )}
              </div>
            </Command.Item>
          ))}
          <Command.Separator className="my-1" />
          <Command.Item
            onSelect={() => setShowCustomDialog(true)}
            value="custom"
          >
            <IconCalendar className="w-4 h-4 mr-2" />
            Custom date
          </Command.Item>
        </Command.List>
      </Command>
      
      <CustomDateDialog
        open={showCustomDialog}
        onOpenChange={setShowCustomDialog}
        onSelectDate={handleCustomDate}
      />
    </Filter.View>
  );
};

const SelectDateFilterBar = ({
  filterKey,
  label,
  icon,
}: SelectDateFilterProps) => {
  const [dateValue, setDateValue] = useQueryState<string>(filterKey);
  const [open, setOpen] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);

  const handleSelect = (value: string) => {
    const option = relativeDateOptions.find(opt => opt.value === value);
    if (option?.getDate) {
      setDateValue(option.getDate().toISOString());
    } else {
      setDateValue(value);
    }
    setOpen(false);
  };

  const handleCustomDate = (date: Date) => {
    setDateValue(date.toISOString());
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={filterKey}>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground ">before</span>
              {icon || <IconCalendarTime className="w-4 h-4" />}
              <span className="font-medium">{getDateLabel(dateValue)}</span>
            </div>
          </Filter.BarButton>
        </Popover.Trigger>
        <Popover.Content align="start" className="w-auto p-0">
          <Command>
            <Command.List>
              {relativeDateOptions.map((option) => (
                <Command.Item
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {dateValue === option.value && (
                      <IconCheck className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </Command.Item>
              ))}
              <Command.Separator className="my-1" />
              <Command.Item
                onSelect={() => {
                  setOpen(false);
                  setShowCustomDialog(true);
                }}
                value="custom"
              >
                <IconCalendar className="w-4 h-4 mr-2" />
                Custom date
              </Command.Item>
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover>
      
      <CustomDateDialog
        open={showCustomDialog}
        onOpenChange={setShowCustomDialog}
        onSelectDate={handleCustomDate}
      />
    </>
  );
};

export const SelectDueDateFilter = {
  FilterView: () => (
    <SelectDateFilterView
      filterKey="targetDate"
      dateType={DateFilterType.DUE_DATE}
      label="Due date"
      showNoDueDate={true}
    />
  ),
  FilterBar: () => (
    <SelectDateFilterBar
      filterKey="targetDate"
      dateType={DateFilterType.DUE_DATE}
      label="Due date"
      icon={<IconCalendarTime className="w-4 h-4" />}
    />
  ),
};

export const SelectCreatedDateFilter = {
  FilterView: () => (
    <SelectDateFilterView
      filterKey="createdDate"
      dateType={DateFilterType.CREATED_DATE}
      label="Created date"
    />
  ),
  FilterBar: () => (
    <SelectDateFilterBar
      filterKey="createdDate"
      dateType={DateFilterType.CREATED_DATE}
      label="Created date"
    />
  ),
};

export const SelectUpdatedDateFilter = {
  FilterView: () => (
    <SelectDateFilterView
      filterKey="updatedDate"
      dateType={DateFilterType.UPDATED_DATE}
      label="Updated date"
    />
  ),
  FilterBar: () => (
    <SelectDateFilterBar
      filterKey="updatedDate"
      dateType={DateFilterType.UPDATED_DATE}
      label="Updated date"
    />
  ),
};

export const SelectStartedDateFilter = {
  FilterView: () => (
    <SelectDateFilterView
      filterKey="startDate"
      dateType={DateFilterType.STARTED_DATE}
      label="Started date"
    />
  ),
  FilterBar: () => (
    <SelectDateFilterBar
      filterKey="startDate"
      dateType={DateFilterType.STARTED_DATE}
      label="Started date"
    />
  ),
};

export const SelectCompletedDateFilter = {
  FilterView: () => (
    <SelectDateFilterView
      filterKey="completedDate"
      dateType={DateFilterType.COMPLETED_DATE}
      label="Completed date"
    />
  ),
  FilterBar: () => (
    <SelectDateFilterBar
      filterKey="completedDate"
      dateType={DateFilterType.COMPLETED_DATE}
      label="Completed date"
    />
  ),
};
