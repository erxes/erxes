import { Combobox, Command, Filter } from 'erxes-ui';
import { ReportDateFilterMenu as DateView } from './ReportDateFilterMenu';
import { IconCheck } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { ReportChannelFilter } from './ReportChannelFilter';
import { CALL_STATUS_OPTIONS, SOURCE_OPTIONS } from '@/report/constants/data';
import {
  getReportCallStatusFilterAtom,
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
  const { t } = useTranslation('frontline');
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
  const [callStatusFilter, setCallStatusFilter] = useAtom(
    getReportCallStatusFilterAtom(cardId),
  );

  const { channels } = useGetChannels();

  const isCallsWithStatus =
    sourceFilter === 'calls' && callStatusFilter !== 'all';
  const hasFilters = Boolean(
    sourceFilter !== 'all' ||
    (channelFilter && channelFilter.length > 0) ||
    (memberFilter && memberFilter.length > 0) ||
    (dateValue && dateValue.length > 0) ||
    isCallsWithStatus,
  );

  const handleClear = () => {
    setSourceFilter('all');
    setChannelFilter([]);
    setMemberFilter([]);
    setDateValue('');
    setCallStatusFilter('all');
  };

  const handleSourceChange = (value: string) => {
    setSourceFilter(value);
    if (value !== 'calls') {
      setCallStatusFilter('all');
    }
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
                <Filter.Item value="source">
                  {t('source', 'Source')}
                </Filter.Item>
                <Filter.Item value="channel">
                  {t('channel-label', 'Channel')}
                </Filter.Item>
                <Filter.Item value="member">
                  {t('member-label', 'Member')}
                </Filter.Item>
                <Filter.Item value="date">{t('date', 'Date')}</Filter.Item>
                {hasFilters && (
                  <>
                    <Command.Separator />
                    <Command.Item
                      value="clear"
                      onSelect={handleClear}
                      className="text-destructive"
                    >
                      {t('clear-all', 'Clear all')}
                    </Command.Item>
                  </>
                )}
              </Command.List>
            </Command>
          </Filter.View>
          <Filter.View filterKey="source">
            <Command shouldFilter={false}>
              <SourceFilterView
                sourceValue={sourceFilter}
                callStatus={callStatusFilter}
                onSourceChange={handleSourceChange}
                onCallStatusChange={setCallStatusFilter}
              />
            </Command>
          </Filter.View>
          <Filter.View filterKey="channel">
            <ReportChannelFilter
              value={channelFilter}
              onValueChange={setChannelFilter}
              channels={channels || []}
            />
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
            <DateView
              filterKey="date"
              selected={dateValue}
              onSelect={setDateValue}
            />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <ReportDateFilterView value={dateValue} onChange={setDateValue} />
    </Filter>
  );
};

const SourceFilterView = ({
  sourceValue,
  callStatus,
  onSourceChange,
  onCallStatusChange,
}: {
  sourceValue: string;
  callStatus: string;
  onSourceChange: (value: string) => void;
  onCallStatusChange: (value: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      {SOURCE_OPTIONS.flatMap((option) => {
        const items = [
          <Command.Item
            key={option.value}
            value={option.value}
            onSelect={() => onSourceChange(option.value)}
          >
            <div className="flex items-center gap-2">
              {sourceValue === option.value && <IconCheck className="size-4" />}
              <span>{t(option.label)}</span>
            </div>
          </Command.Item>,
        ];

        if (option.value === 'calls' && sourceValue === 'calls') {
          items.push(
            ...CALL_STATUS_OPTIONS.map((statusOption) => (
              <Command.Item
                key={`calls-status-${statusOption.value}`}
                value={`calls-status-${statusOption.value}`}
                onSelect={() => onCallStatusChange(statusOption.value)}
                className="pl-7"
              >
                <div className="flex items-center gap-2">
                  {callStatus === statusOption.value && (
                    <IconCheck className="size-4" />
                  )}
                  <span className="text-muted-foreground">
                    {t(statusOption.label)}
                  </span>
                </div>
              </Command.Item>
            )),
          );
        }

        return items;
      })}
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

export { ReportDateFilterMenu as DateView } from './ReportDateFilterMenu';
