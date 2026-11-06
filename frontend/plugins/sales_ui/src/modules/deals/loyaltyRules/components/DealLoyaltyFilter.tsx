import { IconSearch, IconStack2 } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Skeleton,
  isUndefinedOrNull,
  useMultiQueryState,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  SelectBoard,
  SelectCustomer,
  SelectMember,
  SelectPipeline,
  SelectStage,
} from 'ui-modules';
import { dealTotalCountAtom } from '@/deals/states/dealsTotalCountState';

type TDealLoyaltyFilterState = {
  search?: string;
  board?: string[];
  pipeline?: string[];
  stageId?: string;
  assignedUserIds?: string[];
  customerId?: string;
};

const FILTER_KEYS: (keyof TDealLoyaltyFilterState)[] = [
  'search',
  'board',
  'pipeline',
  'stageId',
  'assignedUserIds',
  'customerId',
];

// One board or pipeline narrows the next picker; several leave it open.
const single = (values?: string[] | null) =>
  values?.length === 1 ? values[0] : undefined;

const LoyaltyPointsCount = () => {
  const { t } = useTranslation('sales');
  const totalCount = useAtomValue(dealTotalCountAtom);

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        t('loyalty-records-found', '{{count}} records found', {
          count: totalCount,
        })
      )}
    </div>
  );
};

/** The Loyalty points page's filters: every board and pipeline until chosen. */
export const DealLoyaltyFilter = () => {
  const { t } = useTranslation('sales');
  const [queries] = useMultiQueryState<TDealLoyaltyFilterState>(FILTER_KEYS);
  const { search, board, pipeline, stageId, assignedUserIds, customerId } =
    queries || {};
  const boardId = single(board);
  const pipelineId = single(pipeline);
  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <Filter id="sales-loyalty-filter">
      <Filter.Bar className="overflow-auto styled-scroll">
        <div className="flex flex-wrap items-center gap-2">
          <Filter.Popover scope="sales-loyalty-page">
            <Filter.Trigger isFiltered={hasFilters} />
            <Combobox.Content>
              <Filter.View>
                <Command>
                  <Command.List className="p-1">
                    <Filter.Item value="search" inDialog>
                      <IconSearch />
                      {t('search', 'Search')}
                    </Filter.Item>
                    <Command.Separator className="my-1" />
                    <SelectBoard.FilterItem />
                    <SelectPipeline.FilterItem />
                    {pipelineId && (
                      <Filter.Item value="stageId">
                        <IconStack2 />
                        {t('by-stage', 'By Stage')}
                      </Filter.Item>
                    )}
                    <Command.Separator className="my-1" />
                    <SelectMember.FilterItem
                      value="assignedUserIds"
                      label={t('by-assigned-user', 'By Assigned user')}
                    />
                    <SelectCustomer.FilterItem
                      value="customerId"
                      label={t('by-customer', 'By Customer')}
                    />
                  </Command.List>
                </Command>
              </Filter.View>
              <SelectBoard.FilterView mode="multiple" />
              <SelectPipeline.FilterView mode="multiple" boardId={boardId} />
              {pipelineId && (
                <SelectStage.FilterView
                  queryKey="stageId"
                  pipelineId={pipelineId}
                />
              )}
              <SelectMember.FilterView
                mode="multiple"
                queryKey="assignedUserIds"
              />
              <SelectCustomer.FilterView mode="single" filterKey="customerId" />
            </Combobox.Content>
          </Filter.Popover>
          <Filter.Dialog>
            <Filter.View filterKey="search" inDialog>
              <Filter.DialogStringView
                filterKey="search"
                label={t('search', 'Search')}
              />
            </Filter.View>
          </Filter.Dialog>
        </div>
        {search && (
          <Filter.BarItem queryKey="search">
            <Filter.BarName>
              <IconSearch />
              {t('search', 'Search')}
            </Filter.BarName>
            <Filter.BarButton filterKey="search" inDialog>
              {search}
            </Filter.BarButton>
          </Filter.BarItem>
        )}
        {board && <SelectBoard.FilterBar mode="multiple" />}
        {pipeline && (
          <SelectPipeline.FilterBar mode="multiple" boardId={boardId} />
        )}
        {stageId && pipelineId && (
          <SelectStage.FilterBar queryKey="stageId" pipelineId={pipelineId} />
        )}
        {assignedUserIds && (
          <SelectMember.FilterBar
            mode="multiple"
            queryKey="assignedUserIds"
            label={t('by-user', 'By User')}
          />
        )}
        {customerId && (
          <SelectCustomer.FilterBar
            mode="single"
            filterKey="customerId"
            label={t('by-customer', 'By Customer')}
          />
        )}
        <LoyaltyPointsCount />
      </Filter.Bar>
    </Filter>
  );
};
