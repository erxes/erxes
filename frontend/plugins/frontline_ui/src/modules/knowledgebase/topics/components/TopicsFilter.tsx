import { Filter, useMultiQueryState } from 'erxes-ui';
import { SelectBrand } from 'ui-modules';
import { TOPICS_FILTER_ID } from '@/knowledgebase/constants';
import {
  hasActiveFilters,
  KbFilterPopover,
  KbSearchFilterBar,
} from '@/knowledgebase/shared/components/KbFilter';
import { TopicsTotalCount } from '@/knowledgebase/topics/components/TopicsTotalCount';
import { KnowledgeBaseHotKeyScope } from '@/knowledgebase/types';

export const TopicsFilter = () => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
    brand: string;
  }>(['searchValue', 'brand']);

  return (
    <Filter id={TOPICS_FILTER_ID}>
      <Filter.Bar>
        <KbFilterPopover
          scope={KnowledgeBaseHotKeyScope.TopicsPage}
          isFiltered={hasActiveFilters(queries)}
          items={<SelectBrand.FilterItem />}
          views={<SelectBrand.FilterView />}
        />
        <TopicsTotalCount />
        <KbSearchFilterBar searchValue={queries?.searchValue} />
        <SelectBrand.FilterBar />
      </Filter.Bar>
    </Filter>
  );
};
