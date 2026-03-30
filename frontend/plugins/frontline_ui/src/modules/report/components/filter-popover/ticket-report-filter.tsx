import { cn, Combobox, Command, Filter, useFilterContext } from 'erxes-ui';
import { IconCalendar, IconCheck } from '@tabler/icons-react';
import { useAtom } from 'jotai';

import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { IChannel } from '@/inbox/types/Channel';
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
} from '@/report/states';
import { MemberFormContent } from '../frontline-card/MemberFormContent';
import { SelectMember, SelectCustomer, SelectCompany } from 'ui-modules';
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

  const { channels } = useGetChannels();

  const hasFilters = Boolean(
    (channelFilter && channelFilter.length > 0) ||
    (memberFilter && memberFilter.length > 0) ||
    (dateValue && dateValue.length > 0) ||
    (pipelineFilter && pipelineFilter.length > 0) ||
    (ticketTagFilter && ticketTagFilter.length > 0) ||
    stateFilter ||
    (priorityFilter && priorityFilter.length > 0) ||
    (customerFilter && customerFilter.length > 0) ||
    (companyFilter && companyFilter.length > 0),
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
                <Filter.Item value="frequency">Frequency</Filter.Item>
                <Filter.Item value="date">Date</Filter.Item>
                {hasFilters && (
                  <>
                    <Command.Separator />
                    <Command.Item
                      value="clear"
                      onSelect={handleClear}
                      className="text-red-500"
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
            <SelectCustomer.Provider
              mode="multiple"
              value={customerFilter}
              onValueChange={(val) => setCustomerFilter(val as string[])}
            >
              <SelectCustomer.Content />
            </SelectCustomer.Provider>
          </Filter.View>

          <Filter.View filterKey="company">
            <SelectCompany.Provider
              mode="multiple"
              value={companyFilter}
              onValueChange={(val) => setCompanyFilter(val as string[])}
            >
              <SelectCompany.Content />
            </SelectCompany.Provider>
          </Filter.View>

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
          <Command.Item value="all" onSelect={() => handleSelect('all')}>
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
