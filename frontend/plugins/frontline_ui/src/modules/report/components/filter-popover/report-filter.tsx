import { Button, cn, Combobox, Command, Filter } from 'erxes-ui';
import { IconCheck } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { Except } from 'type-fest';

import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { IChannel } from '@/inbox/types/Channel';
import { DATE_OPTIONS, SOURCE_OPTIONS } from '@/report/constants/data';
import {
  getReportChannelFilterAtom,
  getReportDateFilterAtom,
  getReportMemberFilterAtom,
  getReportSourceFilterAtom,
} from '@/report/states';
import { MemberFormContent } from '../frontline-card/MemberFormContent';
import { SelectMember } from 'ui-modules';
import { ReportDateFilter } from './ReportDateFilter';

interface ReportFilterProps {
  cardId: string;
}

export const ReportFilter = ({ cardId }: ReportFilterProps) => {
  const [sourceFilter, setSourceFilter] = useAtom(
    getReportSourceFilterAtom(cardId),
  );
  const [channelFilter, setChannelFilter] = useAtom(
    getReportChannelFilterAtom(cardId),
  );
  const [memberFilter, setMemberFilter] = useAtom(
    getReportMemberFilterAtom(cardId),
  );
  const [dateValue, setDateValue] = useAtom(getReportDateFilterAtom(cardId));

  const { channels } = useGetChannels();

  const hasFilters = !!(
    sourceFilter !== 'all' ||
    (channelFilter && channelFilter.length > 0) ||
    (memberFilter && memberFilter.length > 0) ||
    (dateValue && dateValue.length > 0)
  );

  const handleClear = () => {
    setSourceFilter('all');
    setChannelFilter([]);
    setMemberFilter([]);
    setDateValue('');
  };

  return (
    <Filter
      id={`report-filter-${cardId}`}
      sessionKey={`report-filter-${cardId}`}
    >
      <Filter.Popover scope={`report-filter-${cardId}`}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Command.List>
                <Filter.Item value="source">Source</Filter.Item>
                <Filter.Item value="channel">Channel</Filter.Item>
                <Filter.Item value="member">Member</Filter.Item>
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
          <Filter.View filterKey="source">
            <Command shouldFilter={false}>
              <SourceFilterView
                value={sourceFilter}
                onValueChange={setSourceFilter}
              />
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
          <Filter.View filterKey="date">
            <Filter.DateView filterKey="date" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <ReportDateFilterView value={dateValue} onChange={setDateValue} />
    </Filter>
  );
};

// Removed SourceFilter and other unused imports
// Kept helper components adjusted for Filter context

const SourceFilterView = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    // Filter view transition is handled by Filter.View's back button
  };

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      {SOURCE_OPTIONS.map((option) => (
        <Command.Item
          key={option.value}
          value={option.value}
          onSelect={() => handleSelect(option.value)}
        >
          <div className="flex items-center gap-2">
            {value === option.value && <IconCheck className="size-4" />}
            <span>{option.label}</span>
          </div>
        </Command.Item>
      ))}
    </Command.List>
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
  const handleSelect = (selectedValue: string) => {
    let newValue: string[];

    if (selectedValue === 'all') {
      newValue = [];
    } else {
      const isSelected = value.includes(selectedValue);
      if (isSelected) {
        newValue = value.filter((id) => id !== selectedValue);
      } else {
        newValue = [...value, selectedValue];
      }
    }

    onValueChange(newValue);
  };

  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
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
}) => {
  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      <SelectMember.Provider
        value={value}
        mode="multiple"
        onValueChange={(val) => {
          onValueChange(val as string[]);
        }}
      >
        <MemberFormContent channelIds={channelIds} exclude={true} />
      </SelectMember.Provider>
    </Command.List>
  );
};

export const ReportDateFilterView = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <Filter.Dialog>
      <Filter.View filterKey="date" inDialog>
        <ReportDateFilter value={value} onChange={onChange} />
      </Filter.View>
    </Filter.Dialog>
  );
};