import {
  Button,
  Dialog,
  Input,
  cn,
  Combobox,
  Command,
  DatePicker,
  Filter,
  useFilterContext,
} from 'erxes-ui';
import {
  IconCalendar,
  IconCheck,
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
import { format } from 'date-fns';
import { toggleFilterValue, toFilterIds } from '@/ticket/utils/filterValues';
import { ReportDateFilterMenu as DateView } from './ReportDateFilterMenu';
import { useEffect, useState, type ReactNode } from 'react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { ReportChannelFilter } from './ReportChannelFilter';
import { type TicketPropertyFilter } from '@/report/types';
import { getDateRange } from '@/report/utils/dateFilters';
import {
  getReportStatusChangedDateFilterAtom,
  getReportUpdatedAtDateFilterAtom,
  getReportDescriptionFilterAtom,
  getReportStatusChangedByFilterAtom,
  getReportUpdatedByFilterAtom,
  getReportChannelFilterAtom,
  getReportDateFilterAtom,
  getReportFrequencyFilterAtom,
  getReportMemberFilterAtom,
  getReportPipelineFilterAtom,
  getReportPriorityFilterAtom,
  getReportStateFilterAtom,
  getReportTicketStatusFilterAtom,
  getReportTicketTagFilterAtom,
  getReportCustomerFilterAtom,
  getReportCompanyFilterAtom,
  getReportPropertyFilterAtom,
  getReportGroupPropertyFilterAtom,
} from '@/report/states';
import {
  TicketReportFilterChip,
  TicketReportPipelineValue,
  TicketReportStatusValue,
} from './TicketReportFilterChip';
import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectStateTicket } from '@/ticket/components/ticket-selects/SelectStateTicket';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import {
  PriorityIcon,
  PriorityTitle,
} from '@/ticket/components/ticket-selects/PriorityInline';
import {
  MembersInline,
  CustomersInline,
  CompaniesInline,
  TagBadge,
  SelectCustomer,
  SelectCompany,
  SelectTags,
  useFields,
} from 'ui-modules';
import { type IField } from 'ui-modules';
import { getReportDisplayValue, ReportDateFilter } from './ReportDateFilter';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';

const FREQUENCY_OPTIONS = [
  { value: 'day', label: 'daily' },
  { value: 'week', label: 'weekly' },
  { value: 'month', label: 'monthly' },
  { value: 'year', label: 'yearly' },
];

const PROPERTY_FILTER_FIELD_TYPES = new Set([
  'select',
  'multiSelect',
  'radio',
  'date',
]);

const GROUP_PROPERTY_FIELD_TYPES = new Set(['select', 'multiSelect', 'radio']);

interface TicketReportFilterProps {
  cardId: string;
  showBar?: boolean;
  children?: ReactNode;
}

export const TicketReportFilter = ({
  cardId,
  showBar = false,
  children,
}: TicketReportFilterProps) => {
  const { t } = useTranslation('frontline');
  const [statusChangedDate, setStatusChangedDate] = useAtom(
    getReportStatusChangedDateFilterAtom(cardId),
  );
  const [updatedAtDate, setUpdatedAtDate] = useAtom(
    getReportUpdatedAtDateFilterAtom(cardId),
  );
  const [description, setDescription] = useAtom(
    getReportDescriptionFilterAtom(cardId),
  );
  const [statusChangedByIds, setStatusChangedBy] = useAtom(
    getReportStatusChangedByFilterAtom(cardId),
  );
  const [updatedByIds, setUpdatedBy] = useAtom(
    getReportUpdatedByFilterAtom(cardId),
  );
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
  const [ticketStatusFilter, setTicketStatusFilter] = useAtom(
    getReportTicketStatusFilterAtom(cardId),
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
  const [groupPropertyFilter, setGroupPropertyFilter] = useAtom(
    getReportGroupPropertyFilterAtom(cardId),
  );

  const { channels } = useGetChannels();
  const { fields, loading: fieldsLoading } = useFields({
    contentType: 'frontline:ticket',
  });
  const filterablePropertyFields = fields.filter((field) =>
    PROPERTY_FILTER_FIELD_TYPES.has(field.type),
  );
  const groupablePropertyFields = fields.filter((field) =>
    GROUP_PROPERTY_FIELD_TYPES.has(field.type),
  );

  const handleClear = () => {
    setStatusChangedDate('');
    setUpdatedAtDate('');
    setDescription('');
    setStatusChangedBy([]);
    setUpdatedBy([]);
    setChannelFilter([]);
    setMemberFilter([]);
    setDateValue('');
    setPipelineFilter([]);
    setTicketTagFilter([]);
    setStateFilter('active');
    setTicketStatusFilter([]);
    setPriorityFilter([]);
    setFrequency('day');
    setCustomerFilter([]);
    setCompanyFilter([]);
    setPropertyFilter([]);
    setGroupPropertyFilter('');
  };

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
  const commandEditor = (content: ReactNode) => (
    <Command shouldFilter={false}>{content}</Command>
  );

  const renderChannelEditor = () => (
    <ReportChannelFilter
      value={channelFilter}
      onValueChange={setChannelFilter}
      channels={channels || []}
    />
  );
  const renderMemberEditor = () => (
    <MemberFilterView value={memberFilter} onValueChange={setMemberFilter} />
  );
  const renderPipelineEditor = () =>
    commandEditor(
      <PipelineFilterView
        value={pipelineFilter}
        onValueChange={setPipelineFilter}
        channelIds={channelFilter}
      />,
    );
  const renderTicketStatusEditor = () => (
    <TicketStatusFilterView
      value={ticketStatusFilter}
      onValueChange={setTicketStatusFilter}
      pipelineId={pipelineFilter[0]}
    />
  );
  const renderStateEditor = () => (
    <StateFilterView value={stateFilter} onValueChange={setStateFilter} />
  );
  const renderPriorityEditor = () => (
    <PriorityFilterView
      value={priorityFilter}
      onValueChange={setPriorityFilter}
    />
  );
  const renderTagEditor = () => (
    <SelectTags.Provider
      mode="multiple"
      tagType="frontline:ticket"
      value={ticketTagFilter}
      onValueChange={(value) => setTicketTagFilter(toFilterIds(value))}
    >
      <SelectTags.Content />
    </SelectTags.Provider>
  );
  const renderCustomerEditor = () => (
    <SelectCustomer.Provider
      mode="multiple"
      value={customerFilter}
      onValueChange={(value) => setCustomerFilter(toFilterIds(value))}
    >
      <SelectCustomer.Content />
    </SelectCustomer.Provider>
  );
  const renderCompanyEditor = () => (
    <SelectCompany.Provider
      mode="multiple"
      value={companyFilter}
      onValueChange={(value) => setCompanyFilter(toFilterIds(value))}
    >
      <SelectCompany.Content />
    </SelectCompany.Provider>
  );
  const renderPropertiesEditor = () =>
    commandEditor(
      <PropertyFilterView
        value={propertyFilter}
        onValueChange={setPropertyFilter}
        fields={filterablePropertyFields}
        loading={fieldsLoading}
      />,
    );
  const renderGroupEditor = () =>
    commandEditor(
      <GroupByFilterView
        value={groupPropertyFilter}
        onValueChange={setGroupPropertyFilter}
        fields={groupablePropertyFields}
        loading={fieldsLoading}
      />,
    );
  const renderFrequencyEditor = () =>
    commandEditor(
      <FrequencyFilterView value={frequency} onValueChange={setFrequency} />,
    );
  const renderStatusChangedByEditor = () => (
    <MemberFilterView
      value={statusChangedByIds}
      onValueChange={setStatusChangedBy}
    />
  );
  const renderUpdatedByEditor = () => (
    <MemberFilterView value={updatedByIds} onValueChange={setUpdatedBy} />
  );
  const dateFilters = [
    {
      key: 'date',
      label: t('created', 'Created'),
      value: dateValue,
      onChange: setDateValue,
    },
    {
      key: 'statusChangedDate',
      label: t('stage-changed-date', 'Stage changed date'),
      value: statusChangedDate,
      onChange: setStatusChangedDate,
    },
    {
      key: 'updatedAtDate',
      label: t('modified-at', 'Modified at'),
      value: updatedAtDate,
      onChange: setUpdatedAtDate,
    },
  ];
  const hasFilters = Boolean(
    channelFilter.length ||
      memberFilter.length ||
      pipelineFilter.length ||
      ticketStatusFilter.length ||
      priorityFilter.length ||
      ticketTagFilter.length ||
      customerFilter.length ||
      companyFilter.length ||
      propertyFilter.length ||
      groupPropertyFilter ||
      stateFilter !== 'active' ||
      frequency !== 'day' ||
      dateValue ||
      statusChangedDate ||
      updatedAtDate ||
      description ||
      statusChangedByIds.length ||
      updatedByIds.length,
  );
  return (
    <Filter
      id={`ticket-report-filter-${cardId}`}
      sessionKey={`ticket-report-filter-${cardId}`}
    >
      <Filter.Bar
        className={showBar ? 'flex-none min-w-0 max-w-full' : 'flex-none'}
      >
        <Filter.Popover scope={`ticket-report-filter-${cardId}`}>
          <Filter.Trigger
            isFiltered={showBar || hasFilters}
            aria-label={t('filter', 'Filter')}
            className={showBar ? 'size-7 shrink-0' : undefined}
          />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput
                  placeholder={t('filter', 'Filter')}
                  variant="secondary"
                  className="bg-background"
                />
                <Command.List className="p-1">
                  <Filter.Item
                    value="channel"
                    keywords={[t('channel-label', 'Channel')]}
                  >
                    <IconUsers />
                    {t('channel-label', 'Channel')}
                  </Filter.Item>
                  <Filter.Item
                    value="member"
                    keywords={[t('assigned-user', 'Assigned User')]}
                  >
                    <IconUser />
                    {t('assigned-user', 'Assigned User')}
                  </Filter.Item>
                  <Filter.Item
                    value="pipeline"
                    keywords={[t('pipelines', 'Pipelines')]}
                  >
                    <IconHierarchy />
                    {t('pipelines', 'Pipelines')}
                  </Filter.Item>
                  <Filter.Item
                    value="ticketStatus"
                    keywords={[t('status', 'Status')]}
                  >
                    <IconProgressCheck />
                    {t('status', 'Status')}
                  </Filter.Item>
                  <Filter.Item
                    value="state"
                    keywords={[t('state-label', 'State')]}
                  >
                    <IconArchive />
                    {t('state-label', 'State')}
                  </Filter.Item>
                  <Filter.Item
                    value="priority"
                    keywords={[t('priority-label', 'Priority')]}
                  >
                    <IconFlag />
                    {t('priority-label', 'Priority')}
                  </Filter.Item>
                  <Filter.Item value="tag" keywords={[t('tags-label', 'Tags')]}>
                    <IconTag />
                    {t('tags-label', 'Tags')}
                  </Filter.Item>
                  <Filter.Item
                    value="customer"
                    keywords={[t('customer-label', 'Customer')]}
                  >
                    <IconUser />
                    {t('customer-label', 'Customer')}
                  </Filter.Item>
                  <Filter.Item
                    value="company"
                    keywords={[t('company-label', 'Company')]}
                  >
                    <IconBuilding />
                    {t('company-label', 'Company')}
                  </Filter.Item>
                  <Filter.Item
                    value="properties"
                    keywords={[t('properties-label', 'Properties')]}
                  >
                    <IconColumns />
                    {t('properties-label', 'Properties')}
                  </Filter.Item>
                  <Filter.Item
                    value="group"
                    keywords={[t('group-by-label', 'Group by')]}
                  >
                    <IconColumns />
                    {t('group-by-label', 'Group by')}
                  </Filter.Item>
                  <Filter.Item
                    value="frequency"
                    keywords={[t('frequency-label', 'Frequency')]}
                  >
                    <IconChartBar />
                    {t('frequency-label', 'Frequency')}
                  </Filter.Item>
                  {dateFilters.map(({ key, label }) => (
                    <Filter.Item key={key} value={key} keywords={[label]}>
                      <IconCalendar />
                      {label}
                    </Filter.Item>
                  ))}
                  <Filter.Item
                    value="description"
                    keywords={[t('description', 'Description')]}
                    inDialog
                  >
                    <IconFileText />
                    {t('description', 'Description')}
                  </Filter.Item>
                  <Filter.Item
                    value="statusChangedByIds"
                    keywords={[t('stage-moved-user', 'Stage moved user')]}
                  >
                    <IconArrowsExchange />
                    {t('stage-moved-user', 'Stage moved user')}
                  </Filter.Item>
                  <Filter.Item
                    value="updatedByIds"
                    keywords={[t('modified-by', 'Modified by')]}
                  >
                    <IconUser />
                    {t('modified-by', 'Modified by')}
                  </Filter.Item>
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

            <Filter.View filterKey="channel">
              {renderChannelEditor()}
            </Filter.View>
            <Filter.View filterKey="member">{renderMemberEditor()}</Filter.View>
            <Filter.View filterKey="pipeline">
              {renderPipelineEditor()}
            </Filter.View>
            <Filter.View filterKey="ticketStatus">
              {renderTicketStatusEditor()}
            </Filter.View>
            <Filter.View filterKey="state">{renderStateEditor()}</Filter.View>
            <Filter.View filterKey="priority">
              {renderPriorityEditor()}
            </Filter.View>
            <Filter.View filterKey="tag">{renderTagEditor()}</Filter.View>
            <Filter.View filterKey="customer">
              {renderCustomerEditor()}
            </Filter.View>
            <Filter.View filterKey="company">
              {renderCompanyEditor()}
            </Filter.View>
            <Filter.View filterKey="properties">
              {renderPropertiesEditor()}
            </Filter.View>
            <Filter.View filterKey="group">{renderGroupEditor()}</Filter.View>
            <Filter.View filterKey="frequency">
              {renderFrequencyEditor()}
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
            {dateFilters.map(({ key, label, value, onChange }) => (
              <Filter.View key={key} filterKey={key}>
                <DateFilterView
                  filterKey={key}
                  label={label}
                  value={value}
                  onChange={onChange}
                />
              </Filter.View>
            ))}
            <Filter.View filterKey="statusChangedByIds">
              {renderStatusChangedByEditor()}
            </Filter.View>
            <Filter.View filterKey="updatedByIds">
              {renderUpdatedByEditor()}
            </Filter.View>
          </Combobox.Content>
        </Filter.Popover>
        {children}
        {showBar && (
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
                renderEditor={renderChannelEditor}
              />
            )}
            {memberFilter.length > 0 && (
              <TicketReportFilterChip
                filterKey="member"
                label={t('assigned-user', 'Assigned User')}
                IconComponent={IconUser}
                value={memberValue(memberFilter)}
                onRemove={() => setMemberFilter([])}
                renderEditor={renderMemberEditor}
              />
            )}
            {pipelineFilter.length > 0 && (
              <TicketReportFilterChip
                filterKey="pipeline"
                label={t('pipelines', 'Pipelines')}
                IconComponent={IconHierarchy}
                value={<TicketReportPipelineValue ids={pipelineFilter} />}
                onRemove={() => setPipelineFilter([])}
                renderEditor={renderPipelineEditor}
              />
            )}
            {ticketStatusFilter.length > 0 && (
              <TicketReportFilterChip
                filterKey="ticketStatus"
                label={t('status', 'Status')}
                IconComponent={IconProgressCheck}
                value={<TicketReportStatusValue ids={ticketStatusFilter} />}
                onRemove={() => setTicketStatusFilter([])}
                renderEditor={renderTicketStatusEditor}
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
                renderEditor={renderStateEditor}
              />
            )}
            {priorityFilter.length > 0 && (
              <TicketReportFilterChip
                filterKey="priority"
                label={t('priority-label', 'Priority')}
                IconComponent={IconFlag}
                value={priorityFilter.map((priority, index) => (
                  <span
                    key={priority}
                    className="inline-flex items-center gap-1"
                  >
                    {index > 0 && ', '}
                    <PriorityIcon priority={priority} />
                    <PriorityTitle priority={priority} />
                  </span>
                ))}
                onRemove={() => setPriorityFilter([])}
                renderEditor={renderPriorityEditor}
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
                    {ticketTagFilter.length > 1 &&
                      ` +${ticketTagFilter.length - 1}`}
                  </>
                }
                onRemove={() => setTicketTagFilter([])}
                renderEditor={renderTagEditor}
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
                renderEditor={renderCustomerEditor}
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
                renderEditor={renderCompanyEditor}
              />
            )}
            {Boolean(groupPropertyFilter) && (
              <TicketReportFilterChip
                filterKey="group"
                label={t('group-by-label', 'Group by')}
                IconComponent={IconColumns}
                value={
                  fields.find((field) => field._id === groupPropertyFilter)
                    ?.name || t('unknown', 'Unknown')
                }
                onRemove={() => setGroupPropertyFilter('')}
                renderEditor={renderGroupEditor}
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
                renderEditor={renderFrequencyEditor}
              />
            )}
            {propertyFilter.map((property) => {
              const field = fields.find(
                (item) => item._id === property.propertyId,
              );
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
                  renderEditor={(close) =>
                    commandEditor(
                      field ? (
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
                      ),
                    )
                  }
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
                renderEditor={renderStatusChangedByEditor}
              />
            )}
            {updatedByIds.length > 0 && (
              <TicketReportFilterChip
                filterKey="updatedByIds"
                label={t('modified-by', 'Modified by')}
                IconComponent={IconUser}
                value={memberValue(updatedByIds)}
                onRemove={() => setUpdatedBy([])}
                renderEditor={renderUpdatedByEditor}
              />
            )}
          </>
        )}
      </Filter.Bar>
      <Filter.Dialog>
        <Filter.View filterKey="description" inDialog>
          <DescriptionFilterDialog
            value={description}
            onChange={setDescription}
          />
        </Filter.View>
        {dateFilters.map(({ key, label, value, onChange }) => (
          <Filter.View key={key} filterKey={key} inDialog>
            <ReportDateFilter label={label} value={value} onChange={onChange} />
          </Filter.View>
        ))}
        {filterablePropertyFields
          .filter((field) => field.type === 'date')
          .map((field) => (
            <Filter.View
              key={field._id}
              filterKey={`property-date-range:${field._id}`}
              inDialog
            >
              <PropertyDateRangeFilter
                field={field}
                value={propertyFilter}
                onValueChange={setPropertyFilter}
              />
            </Filter.View>
          ))}
      </Filter.Dialog>
    </Filter>
  );
};

const DateFilterView = ({
  filterKey,
  label,
  value,
  onChange,
  onClose,
}: {
  filterKey: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
}) => {
  const { setOpen } = useFilterContext();
  const close = onClose || (() => setOpen(false));
  return (
    <DateView
      filterKey={filterKey}
      label={label}
      selected={value}
      onClose={close}
      onSelect={(selected) => {
        onChange(selected);
        close();
      }}
    />
  );
};

const MemberFilterView = ({
  value,
  onValueChange,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
}) => (
  <SelectAssigneeTicket.Provider
    value={value}
    mode="multiple"
    onValueChange={(selected) => onValueChange(toFilterIds(selected))}
  >
    <SelectAssigneeTicket.Content showUnassigned={false} />
  </SelectAssigneeTicket.Provider>
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

  const { t: tPipeline } = useTranslation('frontline');
  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      {loading ? (
        <Command.Empty>{tPipeline('loading')}</Command.Empty>
      ) : (
        <>
          <Command.Item value="all" onSelect={() => onValueChange([])}>
            <div className="flex items-center gap-2">
              {value.length === 0 && <IconCheck className="size-4" />}
              <span>{tPipeline('all-pipelines')}</span>
            </div>
          </Command.Item>
          {pipelines?.map((pipeline) => (
            <Command.Item
              key={pipeline._id}
              value={pipeline._id}
              onSelect={() =>
                onValueChange(toggleFilterValue(value, pipeline._id))
              }
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

const TicketStatusFilterView = ({
  value,
  onValueChange,
  pipelineId,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  pipelineId?: string;
}) => (
  <SelectStatusTicket.Provider
    value={value[0] || ''}
    selectedValues={value}
    pipelineId={pipelineId}
    onValueChange={(selected) =>
      onValueChange(toggleFilterValue(value, selected))
    }
  >
    <SelectStatusTicket.Content onClear={() => onValueChange([])} />
  </SelectStatusTicket.Provider>
);

const StateFilterView = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => (
  <SelectStateTicket.Provider value={value} onValueChange={onValueChange}>
    <SelectStateTicket.Content includeAll />
  </SelectStateTicket.Provider>
);

const PriorityFilterView = ({
  value,
  onValueChange,
}: {
  value: number[];
  onValueChange: (value: number[]) => void;
}) => (
  <SelectPriorityTicket.Provider
    value={value[0] ?? 0}
    selectedValues={value}
    onValueChange={(selected) =>
      onValueChange(toggleFilterValue(value, selected))
    }
  >
    <SelectPriorityTicket.Content onClear={() => onValueChange([])} />
  </SelectPriorityTicket.Provider>
);

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

const GroupByFilterView = ({
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

  return (
    filter.values
      .map(
        (value) =>
          field.options?.find((option) => option.value === value)?.label ||
          value,
      )
      .join(', ') || 'Selected'
  );
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
  onClose,
}: {
  field: IField;
  value: TicketPropertyFilter[];
  onValueChange: (value: TicketPropertyFilter[]) => void;
  onClose?: () => void;
}) => {
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

const getLocalDateFromFilterValue = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
};

const PropertyDateFilter = ({
  field,
  value,
  onValueChange,
  onClose,
}: {
  field: IField;
  value: TicketPropertyFilter[];
  onValueChange: (value: TicketPropertyFilter[]) => void;
  onClose?: () => void;
}) => {
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

const getPropertyDateRangeValue = (values: string[]) => {
  if (values.length < 2) {
    const date = values[0] ? getLocalDateFromFilterValue(values[0]) : undefined;

    if (!date) {
      return '';
    }

    return `${date.toISOString()},${date.toISOString()}`;
  }

  const from = getLocalDateFromFilterValue(values[0]);
  const to = getLocalDateFromFilterValue(values[1]);

  if (!from || !to) {
    return '';
  }

  return `${from.toISOString()},${to.toISOString()}`;
};

const PropertyDateRangeFilter = ({
  field,
  value,
  onValueChange,
}: {
  field: IField;
  value: TicketPropertyFilter[];
  onValueChange: (value: TicketPropertyFilter[]) => void;
}) => {
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

const FrequencyFilterView = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <Command.List className="max-h-[500px] overflow-y-auto">
      {FREQUENCY_OPTIONS.map((option) => (
        <Command.Item
          key={option.value}
          value={option.value}
          onSelect={() => onValueChange(option.value)}
        >
          <div className={cn('flex items-center gap-2')}>
            {value === option.value && <IconCheck className="size-4" />}
            <span>{t(option.label)}</span>
          </div>
        </Command.Item>
      ))}
    </Command.List>
  );
};

const DescriptionFilterDialog = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { setDialogView, setOpenDialog } = useFilterContext();
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  return (
    <Dialog.Content>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onChange(draft.trim());
          setDialogView('root');
          setOpenDialog(false);
        }}
      >
        <Dialog.Header>
          <Dialog.Title>{t('description', 'Description')}</Dialog.Title>
        </Dialog.Header>
        <Input
          aria-label={t('description', 'Description')}
          className="my-4"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="outline">{t('cancel', 'Cancel')}</Button>
          </Dialog.Close>
          <Button type="submit">{t('apply', 'Apply')}</Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  );
};
