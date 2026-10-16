import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
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

export const useTicketReportFilters = (cardId: string) => {
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
  return {
    statusChangedDate,
    setStatusChangedDate,
    updatedAtDate,
    setUpdatedAtDate,
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
    dateValue,
    setDateValue,
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
  };
};

export type TicketReportFilterState = ReturnType<typeof useTicketReportFilters>;
