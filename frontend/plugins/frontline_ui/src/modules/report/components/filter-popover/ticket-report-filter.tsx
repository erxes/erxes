import { Combobox, Filter } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SelectTags,
  SelectCustomer,
  SelectCompany,
  useFields,
} from 'ui-modules';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { toFilterIds } from '@/ticket/utils/filterValues';
import { useTicketReportFilters } from '@/report/hooks/useTicketReportFilters';
import {
  PROPERTY_FILTER_FIELD_TYPES,
  GROUP_PROPERTY_FIELD_TYPES,
} from '@/report/constants/ticketFilters';
import { ReportChannelFilter } from './ReportChannelFilter';
import { ReportDateFilter } from './ReportDateFilter';
import { TicketReportFilterMenu } from './ticket-report-filter/TicketReportFilterMenu';
import {
  TicketReportFilterBar,
  type TicketReportFilterEditors,
} from './ticket-report-filter/TicketReportFilterBar';
import {
  PropertyFilterView,
  GroupByFilterView,
  PropertyValueFilterView,
  PropertyDateRangeFilter,
} from './ticket-report-filter/TicketReportPropertyFilters';
import {
  DateFilterView,
  MemberFilterView,
  PipelineFilterView,
  TicketStatusFilterView,
  StateFilterView,
  PriorityFilterView,
  FrequencyFilterView,
  DescriptionFilterDialog,
  TicketReportFilterCommand,
} from './ticket-report-filter/TicketReportFilterViews';

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
  const filterState = useTicketReportFilters(cardId);
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
    handleClear,
    dateFilters,
    hasFilters,
  } = filterState;
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

  const editors: TicketReportFilterEditors = {
    channel: () => (
      <ReportChannelFilter
        value={channelFilter}
        onValueChange={setChannelFilter}
        channels={channels || []}
      />
    ),
    member: () => (
      <MemberFilterView value={memberFilter} onValueChange={setMemberFilter} />
    ),
    pipeline: () => (
      <TicketReportFilterCommand>
        <PipelineFilterView
          value={pipelineFilter}
          onValueChange={setPipelineFilter}
          channelIds={channelFilter}
        />
      </TicketReportFilterCommand>
    ),
    ticketStatus: () => (
      <TicketStatusFilterView
        value={ticketStatusFilter}
        onValueChange={setTicketStatusFilter}
        pipelineId={pipelineFilter[0]}
      />
    ),
    state: () => (
      <StateFilterView value={stateFilter} onValueChange={setStateFilter} />
    ),
    priority: () => (
      <PriorityFilterView
        value={priorityFilter}
        onValueChange={setPriorityFilter}
      />
    ),
    tag: () => (
      <SelectTags.Provider
        mode="multiple"
        tagType="frontline:ticket"
        value={ticketTagFilter}
        onValueChange={(value) => setTicketTagFilter(toFilterIds(value))}
      >
        <SelectTags.Content />
      </SelectTags.Provider>
    ),
    customer: () => (
      <SelectCustomer.Provider
        mode="multiple"
        value={customerFilter}
        onValueChange={(value) => setCustomerFilter(toFilterIds(value))}
      >
        <SelectCustomer.Content />
      </SelectCustomer.Provider>
    ),
    company: () => (
      <SelectCompany.Provider
        mode="multiple"
        value={companyFilter}
        onValueChange={(value) => setCompanyFilter(toFilterIds(value))}
      >
        <SelectCompany.Content />
      </SelectCompany.Provider>
    ),
    properties: () => (
      <TicketReportFilterCommand>
        <PropertyFilterView
          value={propertyFilter}
          onValueChange={setPropertyFilter}
          fields={filterablePropertyFields}
          loading={fieldsLoading}
        />
      </TicketReportFilterCommand>
    ),
    group: () => (
      <TicketReportFilterCommand>
        <GroupByFilterView
          value={groupPropertyFilter}
          onValueChange={setGroupPropertyFilter}
          fields={groupablePropertyFields}
          loading={fieldsLoading}
        />
      </TicketReportFilterCommand>
    ),
    frequency: () => (
      <TicketReportFilterCommand>
        <FrequencyFilterView value={frequency} onValueChange={setFrequency} />
      </TicketReportFilterCommand>
    ),
    statusChangedByIds: () => (
      <MemberFilterView
        value={statusChangedByIds}
        onValueChange={setStatusChangedBy}
      />
    ),
    updatedByIds: () => (
      <MemberFilterView value={updatedByIds} onValueChange={setUpdatedBy} />
    ),
  };
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
              <TicketReportFilterMenu
                dateFilters={dateFilters}
                hasFilters={hasFilters}
                onClear={handleClear}
              />
            </Filter.View>

            <Filter.View filterKey="channel">{editors.channel()}</Filter.View>
            <Filter.View filterKey="member">{editors.member()}</Filter.View>
            <Filter.View filterKey="pipeline">{editors.pipeline()}</Filter.View>
            <Filter.View filterKey="ticketStatus">
              {editors.ticketStatus()}
            </Filter.View>
            <Filter.View filterKey="state">{editors.state()}</Filter.View>
            <Filter.View filterKey="priority">{editors.priority()}</Filter.View>
            <Filter.View filterKey="tag">{editors.tag()}</Filter.View>
            <Filter.View filterKey="customer">{editors.customer()}</Filter.View>
            <Filter.View filterKey="company">{editors.company()}</Filter.View>
            <Filter.View filterKey="properties">
              {editors.properties()}
            </Filter.View>
            <Filter.View filterKey="group">{editors.group()}</Filter.View>
            <Filter.View filterKey="frequency">
              {editors.frequency()}
            </Filter.View>
            {filterablePropertyFields.map((field) => (
              <Filter.View key={field._id} filterKey={`property:${field._id}`}>
                <TicketReportFilterCommand>
                  <PropertyValueFilterView
                    field={field}
                    value={propertyFilter}
                    onValueChange={setPropertyFilter}
                  />
                </TicketReportFilterCommand>
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
              {editors.statusChangedByIds()}
            </Filter.View>
            <Filter.View filterKey="updatedByIds">
              {editors.updatedByIds()}
            </Filter.View>
          </Combobox.Content>
        </Filter.Popover>
        {children}
        {showBar && (
          <TicketReportFilterBar
            state={filterState}
            editors={editors}
            channels={channels || []}
            fields={fields}
          />
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
