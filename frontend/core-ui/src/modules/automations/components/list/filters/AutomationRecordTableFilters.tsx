import { AUTOMATION_RECORD_TABLE_FILTERS_SESSION_KEY } from '@/automations/constants';
import { AutomationsHotKeyScope } from '@/automations/types';
import {
  Combobox,
  Filter,
  PageSubHeader,
  Skeleton,
  useMultiQueryState,
} from 'erxes-ui';
import { AutomationRecordTableFilterViews } from './AutomationRecordTableFilterViews';
import { AutomationRecordTableFilterMenu } from './AutomationRecordTableFilterMenu';
import { AutomationRecordTableFilterDialogs } from './AutomationRecordTableFilterDialogs';
import { AutomationRecordTableFilterBar } from './AutomationRecordTableFilterBar';

type Props = {
  totalCount: number;
  loading: boolean;
};

export const AutomationRecordTableFilters = ({
  totalCount,
  loading,
}: Props) => {
  const [queries] = useMultiQueryState<{
    searchValue?: string;
    status?: string;
    createdAt: string;
    createdByIds?: string;
    updatedAt: string;
    updatedByIds?: string;
    tagIds?: string[];
  }>([
    'searchValue',
    'status',
    'createdAt',
    'createdByIds',
    'updatedByIds',
    'updatedAt',
    'tagIds',
  ]);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <PageSubHeader>
      <Filter
        id="automation-histories-filter"
        sessionKey={AUTOMATION_RECORD_TABLE_FILTERS_SESSION_KEY}
      >
        <Filter.Popover scope={AutomationsHotKeyScope.RecordTableFilter}>
          <Filter.Trigger isFiltered={hasFilters} />
          <Combobox.Content>
            <AutomationRecordTableFilterMenu />
            <AutomationRecordTableFilterViews />
          </Combobox.Content>
        </Filter.Popover>
        <AutomationRecordTableFilterDialogs />
        <AutomationRecordTableFilterBar />
      </Filter>
      <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
        {totalCount
          ? `${totalCount} records found`
          : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
      </div>
    </PageSubHeader>
  );
};
