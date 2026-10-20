import {
  IconCalendar,
  IconUser,
  IconUsers,
  IconTag,
  IconFileText,
  IconArrowsExchange,
  IconProgressCheck,
  IconArchive,
  IconFlag,
  IconBuilding,
  IconChartBar,
  IconColumns,
  IconHierarchy,
} from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MembersInline,
  CustomersInline,
  CompaniesInline,
  TagBadge,
  type IField,
} from 'ui-modules';
import type { IChannel } from '@/inbox/types/Channel';
import type { TicketReportFilterState } from '@/report/hooks/useTicketReportFilters';
import { SelectStateTicket } from '@/ticket/components/ticket-selects/SelectStateTicket';
import {
  PriorityIcon,
  PriorityTitle,
} from '@/ticket/components/ticket-selects/PriorityInline';
import { FREQUENCY_OPTIONS } from '@/report/constants/ticketFilters';
import {
  clearPropertyFilter,
  getPropertyFilterLabel,
} from '@/report/utils/ticketPropertyFilters';
import { getReportDisplayValue } from '../ReportDateFilter';
import {
  TicketReportFilterChip,
  TicketReportPipelineValue,
  TicketReportStatusValue,
} from '../TicketReportFilterChip';
import { PropertyValueFilterView } from './TicketReportPropertyFilters';
import {
  DateFilterView,
  TicketReportFilterCommand,
} from './TicketReportFilterViews';

export type TicketReportFilterEditors = Record<
  | 'channel'
  | 'member'
  | 'pipeline'
  | 'ticketStatus'
  | 'state'
  | 'priority'
  | 'tag'
  | 'customer'
  | 'company'
  | 'properties'
  | 'group'
  | 'frequency'
  | 'statusChangedByIds'
  | 'updatedByIds',
  () => ReactNode
>;

export const TicketReportFilterBar = ({
  state,
  editors,
  channels,
  fields,
}: {
  state: TicketReportFilterState;
  editors: TicketReportFilterEditors;
  channels: IChannel[];
  fields: IField[];
}) => {
  const { t } = useTranslation('frontline');
  const {
    description,
    setDescription,
    statusChangedByIds,
    setStatusChangedBy,
    updatedByIds,
    setUpdatedBy,
    channelFilter,
    setChannelFilter,
    memberFilter,
    setMemberFilter,
    pipelineFilter,
    setPipelineFilter,
    ticketTagFilter,
    setTicketTagFilter,
    stateFilter,
    setStateFilter,
    ticketStatusFilter,
    setTicketStatusFilter,
    priorityFilter,
    setPriorityFilter,
    frequency,
    setFrequency,
    customerFilter,
    setCustomerFilter,
    companyFilter,
    setCompanyFilter,
    propertyFilter,
    setPropertyFilter,
    groupPropertyFilter,
    setGroupPropertyFilter,
    dateFilters,
  } = state;
  const selectedCount = (count: number) =>
    t('selected-count', '{{count}} selected', { count });
  const memberValue = (ids: string[]) => (
    <MembersInline.Provider
      memberIds={ids}
      placeholder={selectedCount(ids.length)}
    >
      <MembersInline.Avatar size="sm" />
      <MembersInline.Title />
    </MembersInline.Provider>
  );
  return (
    <>
      {channelFilter.length > 0 && (
        <TicketReportFilterChip
          filterKey="channel"
          label={t('channel-label', 'Channel')}
          IconComponent={IconUsers}
          value={channelFilter
            .map(
              (id) =>
                channels?.find((channel) => channel._id === id)?.name ||
                t('unknown', 'Unknown'),
            )
            .join(', ')}
          onRemove={() => setChannelFilter([])}
          renderEditor={editors.channel}
        />
      )}
      {memberFilter.length > 0 && (
        <TicketReportFilterChip
          filterKey="member"
          label={t('assigned-user', 'Assigned User')}
          IconComponent={IconUser}
          value={memberValue(memberFilter)}
          onRemove={() => setMemberFilter([])}
          renderEditor={editors.member}
        />
      )}
      {pipelineFilter.length > 0 && (
        <TicketReportFilterChip
          filterKey="pipeline"
          label={t('pipelines', 'Pipelines')}
          IconComponent={IconHierarchy}
          value={<TicketReportPipelineValue ids={pipelineFilter} />}
          onRemove={() => setPipelineFilter([])}
          renderEditor={editors.pipeline}
        />
      )}
      {ticketStatusFilter.length > 0 && (
        <TicketReportFilterChip
          filterKey="ticketStatus"
          label={t('status', 'Status')}
          IconComponent={IconProgressCheck}
          value={<TicketReportStatusValue ids={ticketStatusFilter} />}
          onRemove={() => setTicketStatusFilter([])}
          renderEditor={editors.ticketStatus}
        />
      )}
      {stateFilter !== 'active' && (
        <TicketReportFilterChip
          filterKey="state"
          label={t('state-label', 'State')}
          IconComponent={IconArchive}
          value={
            <SelectStateTicket.Provider
              value={stateFilter}
              onValueChange={setStateFilter}
            >
              <SelectStateTicket.Value />
            </SelectStateTicket.Provider>
          }
          onRemove={() => setStateFilter('active')}
          renderEditor={editors.state}
        />
      )}
      {priorityFilter.length > 0 && (
        <TicketReportFilterChip
          filterKey="priority"
          label={t('priority-label', 'Priority')}
          IconComponent={IconFlag}
          value={priorityFilter.map((priority, index) => (
            <span key={priority} className="inline-flex items-center gap-1">
              {index > 0 && ', '}
              <PriorityIcon priority={priority} />
              <PriorityTitle priority={priority} />
            </span>
          ))}
          onRemove={() => setPriorityFilter([])}
          renderEditor={editors.priority}
        />
      )}
      {ticketTagFilter.length > 0 && (
        <TicketReportFilterChip
          filterKey="tag"
          label={t('tags-label', 'Tags')}
          IconComponent={IconTag}
          value={
            <>
              <TagBadge tagId={ticketTagFilter[0]} variant="secondary" />
              {ticketTagFilter.length > 1 && ` +${ticketTagFilter.length - 1}`}
            </>
          }
          onRemove={() => setTicketTagFilter([])}
          renderEditor={editors.tag}
        />
      )}
      {customerFilter.length > 0 && (
        <TicketReportFilterChip
          filterKey="customer"
          label={t('customer-label', 'Customer')}
          IconComponent={IconUser}
          value={
            <CustomersInline.Provider
              customerIds={customerFilter}
              placeholder={selectedCount(customerFilter.length)}
            >
              <CustomersInline.Title />
            </CustomersInline.Provider>
          }
          onRemove={() => setCustomerFilter([])}
          renderEditor={editors.customer}
        />
      )}
      {companyFilter.length > 0 && (
        <TicketReportFilterChip
          filterKey="company"
          label={t('company-label', 'Company')}
          IconComponent={IconBuilding}
          value={
            <CompaniesInline.Provider
              companyIds={companyFilter}
              placeholder={selectedCount(companyFilter.length)}
            >
              <CompaniesInline.Title />
            </CompaniesInline.Provider>
          }
          onRemove={() => setCompanyFilter([])}
          renderEditor={editors.company}
        />
      )}
      {Boolean(groupPropertyFilter) && (
        <TicketReportFilterChip
          filterKey="group"
          label={t('group-by-label', 'Group by')}
          IconComponent={IconColumns}
          value={
            fields.find((field) => field._id === groupPropertyFilter)?.name ||
            t('unknown', 'Unknown')
          }
          onRemove={() => setGroupPropertyFilter('')}
          renderEditor={editors.group}
        />
      )}
      {frequency !== 'day' && (
        <TicketReportFilterChip
          filterKey="frequency"
          label={t('frequency-label', 'Frequency')}
          IconComponent={IconChartBar}
          value={t(
            FREQUENCY_OPTIONS.find((option) => option.value === frequency)
              ?.label || frequency,
          )}
          onRemove={() => setFrequency('day')}
          renderEditor={editors.frequency}
        />
      )}
      {propertyFilter.map((property) => {
        const field = fields.find((item) => item._id === property.propertyId);
        return (
          <TicketReportFilterChip
            key={property.propertyId}
            filterKey={`property:${property.propertyId}`}
            label={field?.name || t('properties-label', 'Properties')}
            IconComponent={IconColumns}
            value={
              field
                ? getPropertyFilterLabel(propertyFilter, field)
                : selectedCount(property.values.length)
            }
            onRemove={() =>
              setPropertyFilter(
                clearPropertyFilter(propertyFilter, property.propertyId),
              )
            }
            renderEditor={(close) => (
              <TicketReportFilterCommand>
                {field ? (
                  <PropertyValueFilterView
                    field={field}
                    value={propertyFilter}
                    onValueChange={setPropertyFilter}
                    onClose={close}
                  />
                ) : (
                  <Command.Empty>
                    {t(
                      'no-custom-properties-found',
                      'No custom properties found.',
                    )}
                  </Command.Empty>
                )}
              </TicketReportFilterCommand>
            )}
          />
        );
      })}
      {dateFilters.map(
        ({ key, label, value, onChange }) =>
          value && (
            <TicketReportFilterChip
              key={key}
              filterKey={key}
              label={label}
              IconComponent={IconCalendar}
              value={getReportDisplayValue(value)}
              onRemove={() => onChange('')}
              renderEditor={(close) => (
                <DateFilterView
                  filterKey={key}
                  label={label}
                  value={value}
                  onChange={onChange}
                  onClose={close}
                />
              )}
            />
          ),
      )}
      {description && (
        <TicketReportFilterChip
          filterKey="description"
          label={t('description', 'Description')}
          IconComponent={IconFileText}
          value={description}
          inDialog
          onRemove={() => setDescription('')}
        />
      )}
      {statusChangedByIds.length > 0 && (
        <TicketReportFilterChip
          filterKey="statusChangedByIds"
          label={t('stage-moved-user', 'Stage moved user')}
          IconComponent={IconArrowsExchange}
          value={memberValue(statusChangedByIds)}
          onRemove={() => setStatusChangedBy([])}
          renderEditor={editors.statusChangedByIds}
        />
      )}
      {updatedByIds.length > 0 && (
        <TicketReportFilterChip
          filterKey="updatedByIds"
          label={t('modified-by', 'Modified by')}
          IconComponent={IconUser}
          value={memberValue(updatedByIds)}
          onRemove={() => setUpdatedBy([])}
          renderEditor={editors.updatedByIds}
        />
      )}
    </>
  );
};
