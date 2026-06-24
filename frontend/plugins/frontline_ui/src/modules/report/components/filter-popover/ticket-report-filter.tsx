import {
  cn,
  Combobox,
  Command,
  DatePicker,
  Filter,
  useFilterContext,
} from 'erxes-ui';
import { IconCalendar, IconCheck } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useAtom } from 'jotai';
import { type DateRange } from 'react-day-picker';

import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { IChannel } from '@/inbox/types/Channel';
import { type TicketPropertyFilter } from '@/report/types';
import {
  getReportChannelFilterAtom,
  getReportDateFilterAtom,
  getReportFrequencyFilterAtom,
  getReportMemberFilterAtom,
  getReportPipelineFilterAtom,
  getReportPriorityFilterAtom,
  getReportStateFilterAtom,
  getReportTicketTagFilterAtom,
  getReportCustomerFilterAtom,
  getReportCompanyFilterAtom,
  getReportPropertyFilterAtom,
} from '@/report/states';
import { MemberFormContent } from '../frontline-card/MemberFormContent';
import {
  SelectMember,
  SelectCustomer,
  SelectCompany,
  useFields,
} from 'ui-modules';
import { type IField } from 'ui-modules/modules/properties';
import {
  getReportDisplayValue,
  REPORT_FIXED_DATES,
  ReportDateFilter,
} from './ReportDateFilter';
import { BackButton } from './back-button';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';
import { IPipeline } from '@/pipelines/types';
import { PROJECT_PRIORITIES_OPTIONS } from '@/ticket/constants/priorityOption';

const TICKET_STATE_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
  { value: 'deleted', label: 'Deleted' },
];

const FREQUENCY_OPTIONS = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
];

const PRIORITY_OPTIONS = PROJECT_PRIORITIES_OPTIONS.map((label, index) => ({
  value: index,
  label,
}));

const PROPERTY_FILTER_FIELD_TYPES = ['select', 'multiSelect', 'radio', 'date'];

interface TicketReportFilterProps {
  cardId: string;
}

export const TicketReportFilter = ({ cardId }: TicketReportFilterProps) => {
  const [channelFilter, setChannelFilter] = useAtom(
    getReportChannelFilterAtom(cardId),
  );
  const [memberFilter, setMemberFilter] = useAtom(
    getReportMemberFilterAtom(cardId),
  );
  const [dateValue, setDateValue] = useAtom(getReportDateFilterAtom(cardId));
  const [pipelineFilter, setPipelineFilter] = useAtom(
    getReportPipelineFilterAtom(cardId),
  );
  const [ticketTagFilter, setTicketTagFilter] = useAtom(
    getReportTicketTagFilterAtom(cardId),
  );
  const [stateFilter, setStateFilter] = useAtom(
    getReportStateFilterAtom(cardId),
  );
  const [priorityFilter, setPriorityFilter] = useAtom(
    getReportPriorityFilterAtom(cardId),
  );
  const [frequency, setFrequency] = useAtom(
    getReportFrequencyFilterAtom(cardId),
  );
  const [customerFilter, setCustomerFilter] = useAtom(
    getReportCustomerFilterAtom(cardId),
  );
  const [companyFilter, setCompanyFilter] = useAtom(
    getReportCompanyFilterAtom(cardId),
  );
  const [propertyFilter, setPropertyFilter] = useAtom(
    getReportPropertyFilterAtom(cardId),
  );

  const { channels } = useGetChannels();
  const { fields, loading: fieldsLoading } = useFields({
    contentType: 'frontline:ticket',
  });
  const filterablePropertyFields = fields.filter((field) =>
    PROPERTY_FILTER_FIELD_TYPES.includes(field.type),
  );

  const hasFilters = Boolean(
    (channelFilter && channelFilter.length > 0) ||
      (memberFilter && memberFilter.length > 0) ||
      (dateValue && dateValue.length > 0) ||
      (pipelineFilter && pipelineFilter.length > 0) ||
      (ticketTagFilter && ticketTagFilter.length > 0) ||
      stateFilter ||
      (priorityFilter && priorityFilter.length > 0) ||
      (customerFilter && customerFilter.length > 0) ||
      (companyFilter && companyFilter.length > 0) ||
      (propertyFilter && propertyFilter.length > 0),
  );

  const handleClear = () => {
    setChannelFilter([]);
    setMemberFilter([]);
    setDateValue('');
    setPipelineFilter([]);
    setTicketTagFilter([]);
    setStateFilter('');
    setPriorityFilter([]);
    setFrequency('day');
    setCustomerFilter([]);
    setCompanyFilter([]);
    setPropertyFilter([]);
  };

  return (
    <Filter
      id={`ticket-report-filter-${cardId}`}
      sessionKey={`ticket-report-filter-${cardId}`}
    >
      <Filter.Popover scope={`ticket-report-filter-${cardId}`}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Command.List>
                <Filter.Item value="channel">Channel</Filter.Item>
                <Filter.Item value="member">Assigned User</Filter.Item>
                <Filter.Item value="pipeline">Pipeline</Filter.Item>
                <Filter.Item value="state">State</Filter.Item>
                <Filter.Item value="priority">Priority</Filter.Item>
                <Filter.Item value="customer">Customer</Filter.Item>
                <Filter.Item value="company">Company</Filter.Item>
                <Filter.Item value="properties">Properties</Filter.Item>
                <Filter.Item value="frequency">Frequency</Filter.Item>
                <Filter.Item value="date">Date</Filter.Item>
                {hasFilters && (
                  <>
                    <Command.Separator />
                    <Command.Item
                      value="clear"
                      onSelect={handleClear}
                      className="text-destructive"
                    >
                      Clear all
                    </Command.Item>
                  </>
                )}
              </Command.List>
            </Command>
          </Filter.View>

          <Filter.View filterKey="channel">
            <Command shouldFilter={false}>
              <ChannelFilterView
                value={channelFilter}
                onValueChange={setChannelFilter}
                channels={channels || []}
              />
            </Command>
          </Filter.View>

          <Filter.View filterKey="member">
            <Command shouldFilter={false}>
              <MemberFilterView
                value={memberFilter}
                onValueChange={setMemberFilter}
                channelIds={channelFilter}
              />
            </Command>
          </Filter.View>

          <Filter.View filterKey="pipeline">
            <Command shouldFilter={false}>
              <PipelineFilterView
                value={pipelineFilter}
                onValueChange={setPipelineFilter}
                channelIds={channelFilter}
              />
            </Command>
          </Filter.View>

          <Filter.View filterKey="state">
            <Command shouldFilter={false}>
              <StateFilterView
                value={stateFilter}
                onValueChange={setStateFilter}
              />
            </Command>
          </Filter.View>

          <Filter.View filterKey="priority">
            <Command shouldFilter={false}>
              <PriorityFilterView
                value={priorityFilter}
                onValueChange={setPriorityFilter}
              />
            </Command>
          </Filter.View>

          <Filter.View filterKey="customer">
            <Command shouldFilter={false}>
              <Command.List>
                <BackButton />
              </Command.List>
              <SelectCustomer.Provider
                mode="multiple"
                value={customerFilter}
                onValueChange={(val) => setCustomerFilter(val as string[])}
              >
                <SelectCustomer.Content />
              </SelectCustomer.Provider>
            </Command>
          </Filter.View>

          <Filter.View filterKey="company">
            <Command shouldFilter={false}>
              <Command.List>
                <BackButton />
              </Command.List>
              <SelectCompany.Provider
                mode="multiple"
                value={companyFilter}
                onValueChange={(val) => setCompanyFilter(val as string[])}
              >
                <SelectCompany.Content />
              </SelectCompany.Provider>
            </Command>
          </Filter.View>

          <Filter.View filterKey="properties">
            <Command shouldFilter={false}>
              <PropertyFilterView
                value={propertyFilter}
                onValueChange={setPropertyFilter}
                fields={filterablePropertyFields}
                loading={fieldsLoading}
              />
            </Command>
          </Filter.View>

          {filterablePropertyFields.map((field) => (
            <Filter.View key={field._id} filterKey={`property:${field._id}`}>
              <Command shouldFilter={false}>
                <PropertyValueFilterView
                  field={field}
                  value={propertyFilter}
                  onValueChange={setPropertyFilter}
                />
              </Command>
            </Filter.View>
          ))}

          <Filter.View filterKey="frequency">
            <Command shouldFilter={false}>
              <FrequencyFilterView
                value={frequency}
                onValueChange={setFrequency}
              />
            </Command>
          </Filter.View>

          <Filter.View filterKey="date">
            <DateView
              filterKey="date"
              selected={dateValue}
              onSelect={setDateValue}
            />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="date" inDialog>
          <ReportDateFilter value={dateValue} onChange={setDateValue} />
        </Filter.View>
      </Filter.Dialog>
    </Filter>
  );
};

const ChannelFilterView = ({
  value,
  onValueChange,
  channels,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  channels: IChannel[];
}) => {
  const handleSelect = (id: string) => {
    if (id === 'all') {
      onValueChange([]);
      return;
    }
    const isSelected = value.includes(id);
    onValueChange(isSelected ? value.filter((v) => v !== id) : [...value, id]);
  };

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      <BackButton />
      <Command.Item value="all" onSelect={() => handleSelect('all')}>
        <div className="flex items-center gap-2">
          {(!value || value.length === 0) && <IconCheck className="size-4" />}
          <span>All Channels</span>
        </div>
      </Command.Item>
      {channels.map((channel) => (
        <Command.Item
          key={channel._id}
          value={channel._id}
          onSelect={() => handleSelect(channel._id)}
        >
          <div className="flex items-center gap-2">
            {value.includes(channel._id) && <IconCheck className="size-4" />}
            <span>{channel.name}</span>
          </div>
        </Command.Item>
      ))}
    </Command.List>
  );
};

const MemberFilterView = ({
  value,
  onValueChange,
  channelIds,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  channelIds: string[];
}) => (
  <Command.List className="max-h-[500px] overflow-y-auto">
    <BackButton />
    <SelectMember.Provider
      value={value}
      mode="multiple"
      onValueChange={(val) => onValueChange(val as string[])}
    >
      <MemberFormContent channelIds={channelIds} exclude={true} />
    </SelectMember.Provider>
  </Command.List>
);

const PipelineFilterView = ({
  value,
  onValueChange,
  channelIds,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  channelIds: string[];
}) => {
  const { pipelines, loading } = useGetPipelines({
    variables: {
      filter: {
        channelId: channelIds[0],
        applyVisibilityFilter: true,
      },
    },
    skip: channelIds.length === 0,
  });

  const handleSelect = (id: string) => {
    if (id === 'all') {
      onValueChange([]);
      return;
    }
    const isSelected = value.includes(id);
    onValueChange(isSelected ? value.filter((v) => v !== id) : [...value, id]);
  };

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      <BackButton />
      {loading ? (
        <Command.Empty>Loading...</Command.Empty>
      ) : (
        <>
          <Command.Item value="all" onSelect={() => onValueChange([])}>
            <div className="flex items-center gap-2">
              {value.length === 0 && <IconCheck className="size-4" />}
              <span>All Pipelines</span>
            </div>
          </Command.Item>
          {(pipelines as IPipeline[] | undefined)?.map((pipeline) => (
            <Command.Item
              key={pipeline._id}
              value={pipeline._id}
              onSelect={() => handleSelect(pipeline._id)}
            >
              <div className="flex items-center gap-2">
                {value.includes(pipeline._id) && (
                  <IconCheck className="size-4" />
                )}
                <span>{pipeline.name}</span>
              </div>
            </Command.Item>
          ))}
        </>
      )}
    </Command.List>
  );
};

const StateFilterView = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => (
  <Command.List className="max-h-[500px] overflow-y-auto">
    <BackButton />
    <Command.Item value="all" onSelect={() => onValueChange('')}>
      <div className="flex items-center gap-2">
        {!value && <IconCheck className="size-4" />}
        <span>All States</span>
      </div>
    </Command.Item>
    {TICKET_STATE_OPTIONS.map((option) => (
      <Command.Item
        key={option.value}
        value={option.value}
        onSelect={() => onValueChange(option.value)}
      >
        <div className="flex items-center gap-2">
          {value === option.value && <IconCheck className="size-4" />}
          <span>{option.label}</span>
        </div>
      </Command.Item>
    ))}
  </Command.List>
);

const PriorityFilterView = ({
  value,
  onValueChange,
}: {
  value: number[];
  onValueChange: (value: number[]) => void;
}) => {
  const handleSelect = (priority: number) => {
    const isSelected = value.includes(priority);
    onValueChange(
      isSelected ? value.filter((v) => v !== priority) : [...value, priority],
    );
  };

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      <BackButton />
      <Command.Item value="all" onSelect={() => onValueChange([])}>
        <div className="flex items-center gap-2">
          {value.length === 0 && <IconCheck className="size-4" />}
          <span>All Priorities</span>
        </div>
      </Command.Item>
      {PRIORITY_OPTIONS.map((option) => (
        <Command.Item
          key={option.value}
          value={String(option.value)}
          onSelect={() => handleSelect(option.value)}
        >
          <div className="flex items-center gap-2">
            {value.includes(option.value) && <IconCheck className="size-4" />}
            <span>{option.label}</span>
          </div>
        </Command.Item>
      ))}
    </Command.List>
  );
};

const PropertyFilterView = ({
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
  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      <BackButton />
      {loading ? (
        <Command.Empty>Loading...</Command.Empty>
      ) : (
        <>
          <Command.Item value="all" onSelect={() => onValueChange([])}>
            <div className="flex items-center gap-2">
              {(!value || value.length === 0) && (
                <IconCheck className="size-4" />
              )}
              <span>All Properties</span>
            </div>
          </Command.Item>
          {fields.length === 0 && (
            <Command.Empty>
              No filterable custom properties found.
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

const getPropertyFilterLabel = (
  filters: TicketPropertyFilter[],
  field: IField,
) => {
  const filter = filters.find((item) => item.propertyId === field._id);

  if (!filter) {
    return '';
  }

  if (field.type === 'date') {
    if (filter.values.length > 1) {
      return `${filter.values[0]} - ${filter.values[1]}`;
    }

    return filter.values[0] || 'Selected';
  }

  return `${filter.values.length} selected`;
};

const getPropertyFilterValues = (
  filters: TicketPropertyFilter[],
  fieldId: string,
) => filters.find((item) => item.propertyId === fieldId)?.values || [];

const setPropertyFilterValues = ({
  filters,
  field,
  values,
}: {
  filters: TicketPropertyFilter[];
  field: IField;
  values: string[];
}) => {
  const otherFilters = filters.filter((item) => item.propertyId !== field._id);

  return [
    ...otherFilters,
    {
      propertyId: field._id,
      type: field.type,
      values,
    },
  ];
};

const clearPropertyFilter = (
  filters: TicketPropertyFilter[],
  fieldId: string,
) => filters.filter((item) => item.propertyId !== fieldId);

const PropertyValueFilterView = ({
  field,
  value,
  onValueChange,
}: {
  field: IField;
  value: TicketPropertyFilter[];
  onValueChange: (value: TicketPropertyFilter[]) => void;
}) => {
  if (field.type === 'date') {
    return (
      <PropertyDateFilter
        field={field}
        value={value}
        onValueChange={onValueChange}
      />
    );
  }

  const selectedValues = getPropertyFilterValues(value, field._id);
  const options = field.options || [];

  const handleValueSelect = (optionValue: string) => {
    const isSelected = selectedValues.includes(optionValue);
    const supportsMultipleValues =
      field.type === 'select' || field.type === 'multiSelect';
    const nextValues = supportsMultipleValues
      ? isSelected
        ? selectedValues.filter((item) => item !== optionValue)
        : [...selectedValues, optionValue]
      : isSelected
      ? []
      : [optionValue];

    onValueChange(
      nextValues.length
        ? setPropertyFilterValues({ filters: value, field, values: nextValues })
        : clearPropertyFilter(value, field._id),
    );
  };

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      <BackButton view="properties" />
      {options.length === 0 && <Command.Empty>No options found.</Command.Empty>}
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
        Clear property
      </Command.Item>
    </Command.List>
  );
};

const getLocalDateFromFilterValue = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
};

const getLocalDateRangeFromFilterValues = (
  values: string[],
): DateRange | undefined => {
  if (values.length < 2) {
    return undefined;
  }

  const from = getLocalDateFromFilterValue(values[0]);
  const to = getLocalDateFromFilterValue(values[1]);

  if (!from || !to) {
    return undefined;
  }

  return { from, to };
};

const PropertyDateFilter = ({
  field,
  value,
  onValueChange,
}: {
  field: IField;
  value: TicketPropertyFilter[];
  onValueChange: (value: TicketPropertyFilter[]) => void;
}) => {
  const selectedValues = getPropertyFilterValues(value, field._id);
  const selectedValue = selectedValues[0];
  const selectedDate =
    selectedValue && selectedValues.length === 1
      ? getLocalDateFromFilterValue(selectedValue)
      : undefined;
  const selectedRange = getLocalDateRangeFromFilterValues(selectedValues);

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      <BackButton view="properties" />
      <div className="space-y-3 px-2 py-2">
        <div className="space-y-1.5">
          <div className="text-muted-foreground px-1 text-xs font-medium">
            Exact date
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
            placeholder="Select exact date"
            className="w-full"
            defaultMonth={selectedDate || new Date()}
          />
        </div>
        <div className="space-y-1.5">
          <div className="text-muted-foreground px-1 text-xs font-medium">
            Date range
          </div>
          <DatePicker
            value={selectedRange}
            onChange={(date) => {
              const range = date as DateRange | undefined;

              if (range?.from && range?.to) {
                onValueChange(
                  setPropertyFilterValues({
                    filters: value,
                    field,
                    values: [
                      format(range.from, 'yyyy-MM-dd'),
                      format(range.to, 'yyyy-MM-dd'),
                    ],
                  }),
                );
              }
            }}
            mode="range"
            format="MMM D, YYYY"
            placeholder="Select date range"
            className="w-full"
            defaultMonth={selectedRange?.from || selectedDate || new Date()}
          />
        </div>
      </div>
      <Command.Separator />
      <Command.Item
        value={`${field._id}:clear`}
        onSelect={() => onValueChange(clearPropertyFilter(value, field._id))}
        className="text-destructive"
      >
        Clear property
      </Command.Item>
    </Command.List>
  );
};

const FrequencyFilterView = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => (
  <Command.List className="max-h-[500px] overflow-y-auto">
    <BackButton />
    {FREQUENCY_OPTIONS.map((option) => (
      <Command.Item
        key={option.value}
        value={option.value}
        onSelect={() => onValueChange(option.value)}
      >
        <div className={cn('flex items-center gap-2')}>
          {value === option.value && <IconCheck className="size-4" />}
          <span>{option.label}</span>
        </div>
      </Command.Item>
    ))}
  </Command.List>
);

const DateView = ({
  filterKey,
  selected,
  onSelect,
}: {
  filterKey: string;
  selected?: string;
  onSelect?: (value: string) => void;
}) => {
  const { setDialogView, setOpenDialog, setOpen } = useFilterContext();

  const isCustomDate = selected && !REPORT_FIXED_DATES.includes(selected);

  const handleCustomRange = () => {
    setDialogView('date');
    setOpenDialog(true);
    setOpen(false);
  };

  return (
    <Command>
      <Command.Input
        placeholder={
          filterKey.charAt(0).toUpperCase() + filterKey.slice(1) + ' date'
        }
        focusOnMount
      />
      <Command.List>
        <BackButton />
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
          {isCustomDate ? getReportDisplayValue(selected) : 'Custom Range...'}
        </Command.Item>
      </Command.List>
    </Command>
  );
};
