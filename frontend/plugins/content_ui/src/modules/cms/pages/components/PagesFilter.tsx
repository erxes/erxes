import { IconSearch } from '@tabler/icons-react';
import { Filter, useFilterQueryState } from 'erxes-ui';
import { PAGES_CURSOR_SESSION_KEY } from '../constants/pagesCursorSessionKey';
import { SimpleSearchFilterPopover } from '~/modules/cms/shared/components/SimpleSearchFilterPopover';
import { PagesTotalCount } from './PagesTotalCount';

export const PagesFilter = () => {
  const [searchValue] = useFilterQueryState<string>('searchValue');

  return (
    <Filter id="pages-filter" sessionKey={PAGES_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            Search
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <SimpleSearchFilterPopover />
        <PagesTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
