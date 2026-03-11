import {
  Combobox,
  Command,
  Filter,
  useQueryState,
  useMultiQueryState,
} from 'erxes-ui';
import {
  IconCalendarEvent,
  IconCheck,
  IconProgressCheck,
} from '@tabler/icons-react';
import { TOURS_CURSOR_SESSION_KEY } from '../constants/tourCursorSessionKey';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
  { value: 'cancelled', label: 'Cancelled' },
];

const DATE_STATUS_OPTIONS = [
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'unscheduled', label: 'Unscheduled' },
] as const;

function SelectStatusFilterItem() {
  return (
    <Filter.Item value="status">
      <IconProgressCheck />
      Status
    </Filter.Item>
  );
}

function SelectDateStatusFilterItem() {
  return (
    <Filter.Item value="date_status">
      <IconCalendarEvent />
      Date status
    </Filter.Item>
  );
}

function SelectStatusFilterView() {
  const [status, setStatus] = useQueryState<string | undefined>('status');

  return (
    <Filter.View filterKey="status">
      <Command>
        <Command.Input placeholder="Search status" />
        <Command.List>
          {STATUS_OPTIONS.map((item) => (
            <Command.Item
              key={item.value}
              value={item.value}
              onSelect={() => setStatus(item.value)}
            >
              {item.label}
              {status === item.value && <IconCheck />}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
}

function SelectDateStatusFilterView() {
  const [dateStatus, setDateStatus] = useQueryState<string | undefined>(
    'date_status',
  );

  return (
    <Filter.View filterKey="date_status">
      <Command>
        <Command.Input placeholder="Search date status" />
        <Command.List>
          {DATE_STATUS_OPTIONS.map((item) => (
            <Command.Item
              key={item.value}
              value={item.value}
              onSelect={() => setDateStatus(item.value)}
            >
              {item.label}
              {dateStatus === item.value && <IconCheck />}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
}

const TourFilterPopover = () => {
  return (
    <>
      <Filter.Popover>
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder="Filter" variant="secondary" />
              <Command.List className="p-1">
                <Filter.SearchValueTrigger />
                <Command.Separator className="my-1" />
                <SelectStatusFilterItem />
                <SelectDateStatusFilterItem />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectStatusFilterView />
          <SelectDateStatusFilterView />
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const TourFilter = () => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
    status: string;
    date_status: string;
  }>(['searchValue', 'status', 'date_status']);

  const selectedStatusLabel = STATUS_OPTIONS.find(
    (item) => item.value === queries?.status,
  )?.label;

  const selectedDateStatusLabel = DATE_STATUS_OPTIONS.find(
    (item) => item.value === queries?.date_status,
  )?.label;

  return (
    <Filter id="tours-filter" sessionKey={TOURS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <TourFilterPopover />
        <Filter.SearchValueBarItem />

        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconProgressCheck />
            Status
          </Filter.BarName>
          <Filter.BarButton filterKey="status">
            {selectedStatusLabel || 'Select status'}
          </Filter.BarButton>
        </Filter.BarItem>

        <Filter.BarItem queryKey="date_status">
          <Filter.BarName>
            <IconCalendarEvent />
            Date status
          </Filter.BarName>
          <Filter.BarButton filterKey="date_status">
            {selectedDateStatusLabel || 'Select date status'}
          </Filter.BarButton>
        </Filter.BarItem>
      </Filter.Bar>
    </Filter>
  );
};
