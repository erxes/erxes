import type { LeadRecordType, LeadStage } from '@erxes/core-contract';
import { type InfiniteData, skipToken, useInfiniteQuery } from '@tanstack/react-query';
import { Board, useFormat } from 'erxes-ui';
import { memo } from 'react';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { type CursorPage, forwardPaging } from '~/lib/cursorList';
import { useCompaniesFilters } from '~/modules/contacts/companies/useCompanies';
import { useCustomersFilters } from '~/modules/contacts/customers/useCustomers';
import { useLeadsT, useStageName } from './i18n';
import { LeadCard } from './LeadCard';
import type { BoardLead } from './useBoardMove';

const PAGE = 30;

const column = ({ pages }: Pick<InfiniteData<CursorPage<BoardLead>>, 'pages'>) => ({
  leads: pages.flatMap((page) => page.data),
  total: pages[0],
});

/** One stage's leads, newest first, a page at a time (with the list's search, tags, owner and advanced filter). */
const useStageLeads = (recordType: LeadRecordType, stageId: string) => {
  const paging = forwardPaging(PAGE);
  const people = { ...useCustomersFilters('lead'), leadStageId: stageId };
  const companyFilters = { ...useCompaniesFilters('lead'), leadStageId: stageId };

  const customers = useInfiniteQuery(
    orpc.customers.list.infiniteOptions({
      input: recordType === 'customer' ? (page) => ({ ...page, ...people }) : skipToken,
      ...paging,
      select: column,
    }),
  );

  const companies = useInfiniteQuery(
    orpc.companies.list.infiniteOptions({
      input: recordType === 'company' ? (page) => ({ ...page, ...companyFilters }) : skipToken,
      ...paging,
      select: column,
    }),
  );

  return recordType === 'company' ? companies : customers;
};

export const StageColumn = memo(function StageColumn({
  recordType,
  stage,
  onAdd,
}: {
  recordType: LeadRecordType;
  stage: LeadStage;
  onAdd: (stageId: string) => void;
}) {
  const t = useLeadsT();
  const fmt = useFormat();
  const stageName = useStageName();
  const query = useStageLeads(recordType, stage.id);
  const first = query.data?.total;

  return (
    <Board.Column
      id={stage.id}
      title={stageName(stage.name)}
      color={stage.color}
      count={first ? fmt.count(first.totalCount, first.totalCapped) : '·'}
      add={{ label: t('board.add-here'), onClick: () => onAdd(stage.id) }}
      loading={query.isPending}
      error={query.error ? messageOf(query.error) : undefined}
      empty={t('board.empty')}
      pages={query}
    >
      {query.data?.leads.map((lead) => (
        <LeadCard key={lead.id} recordType={recordType} lead={lead} />
      ))}
    </Board.Column>
  );
});
