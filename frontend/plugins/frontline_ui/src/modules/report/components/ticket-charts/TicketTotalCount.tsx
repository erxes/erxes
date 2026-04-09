import { Alert, InfoCard } from 'erxes-ui';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { useTicketTotalCount } from '@/report/hooks/useTicketTotalCount';
import { useAtom } from 'jotai';
import { useState, useEffect } from 'react';
import { getFilters } from '@/report/utils/dateFilters';
import {
  getReportDateFilterAtom,
  getReportChannelFilterAtom,
  getReportMemberFilterAtom,
  getReportPipelineFilterAtom,
  getReportStateFilterAtom,
  getReportPriorityFilterAtom,
  getReportTicketTagFilterAtom,
  getReportCustomerFilterAtom,
  getReportCompanyFilterAtom,
} from '@/report/states';
import { TicketReportFilter } from '../filter-popover/ticket-report-filter';

interface TicketTotalCountProps {
  title: string;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

export const TicketTotalCount = ({
  title,
  colSpan = 6,
  onColSpanChange,
}: TicketTotalCountProps) => {
  const id = title.toLowerCase().replace(/\s+/g, '-');
  const [dateValue] = useAtom(getReportDateFilterAtom(id));
  const [channelFilter] = useAtom(getReportChannelFilterAtom(id));
  const [memberFilter] = useAtom(getReportMemberFilterAtom(id));
  const [pipelineFilter] = useAtom(getReportPipelineFilterAtom(id));
  const [stateFilter] = useAtom(getReportStateFilterAtom(id));
  const [priorityFilter] = useAtom(getReportPriorityFilterAtom(id));
  const [tagFilter] = useAtom(getReportTicketTagFilterAtom(id));
  const [customerFilter] = useAtom(getReportCustomerFilterAtom(id));
  const [companyFilter] = useAtom(getReportCompanyFilterAtom(id));
  const [filters, setFilters] = useState(() => getFilters());

  useEffect(() => {
    setFilters(getFilters(dateValue || undefined));
  }, [dateValue]);

  const { totalCount, loading, error } = useTicketTotalCount({
    variables: {
      filters: {
        ...filters,
        channelIds: channelFilter.length ? channelFilter : undefined,
        memberIds: memberFilter.length ? memberFilter : undefined,
        pipelineIds: pipelineFilter.length ? pipelineFilter : undefined,
        state: stateFilter || undefined,
        priority: priorityFilter.length ? priorityFilter : undefined,
        tagIds: tagFilter.length ? tagFilter : undefined,
        customerIds: customerFilter.length ? customerFilter : undefined,
        companyIds: companyFilter.length ? companyFilter : undefined,
      },
    },
  });

  if (error) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="Total ticket count"
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Content>
          <Alert variant="destructive">
            <Alert.Title>Error loading data</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert>
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  return (
    <FrontlineCard
      id={id}
      title={title}
      description="Total ticket count"
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header filter={<TicketReportFilter cardId={id} />} />
      <FrontlineCard.Content>
        <InfoCard title="Total Tickets">
          <InfoCard.Content className="text-center">
            {loading ? (
              <span className="text-muted-foreground text-sm">Loading...</span>
            ) : (
              <span className="text-2xl font-bold">{totalCount}</span>
            )}
          </InfoCard.Content>
        </InfoCard>
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};
