import {
  IconCalendarPlus,
  IconCalendarUp,
  IconLabel,
  IconSearch,
} from '@tabler/icons-react';

import {
  Combobox,
  Command,
  Filter,
  useFilterQueryState,
  useMultiQueryState,
} from 'erxes-ui';
import { PostsHotKeyScope } from '../types/PostsHotKeyScope';
import { PostsTotalCount } from './PostsTotalCount';
import { useIsPostsLeadSessionKey } from '../hooks/usePostsLeadSessionKey';
import { SelectStatus } from './selects/SelectStatus';
import { SelectTags } from './selects/SelectTags';
import { SelectCategories } from './selects/SelectCategories';

interface PostsFilterPopoverProps {
  clientPortalId?: string;
}

const PostsFilterPopover = ({ clientPortalId }: PostsFilterPopoverProps) => {
  const [queries] = useMultiQueryState<{
    tags: string[];
    searchValue: string;
    status: string;
    type: string;
    categories: string;
    created: string;
    updated: string;
    publishedDate: string;
  }>([
    'tags',
    'searchValue',
    'status',
    'type',
    'categories',
    'created',
    'updated',
    'publishedDate',
  ]);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope={PostsHotKeyScope.PostsPage}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  Search
                </Filter.Item>
                <SelectStatus.FilterItem />
                <Filter.Item value="type" inDialog>
                  <IconLabel />
                  Type
                </Filter.Item>
                <SelectTags.FilterItem />
                <SelectCategories.FilterItem />
                <Command.Separator className="my-1" />
                <Filter.Item value="created">
                  <IconCalendarPlus />
                  Created At
                </Filter.Item>
                <Filter.Item value="updated">
                  <IconCalendarUp />
                  Updated At
                </Filter.Item>
                <Filter.Item value="publishedDate">
                  <IconCalendarPlus />
                  Publish Date
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectTags.FilterView clientPortalId={clientPortalId || ''} />
          <SelectCategories.FilterView clientPortalId={clientPortalId || ''} />
          <SelectStatus.FilterView />
          <Filter.View filterKey="created">
            <Filter.DateView filterKey="created" />
          </Filter.View>
          <Filter.View filterKey="updated">
            <Filter.DateView filterKey="updated" />
          </Filter.View>
          <Filter.View filterKey="publishedDate">
            <Filter.DateView filterKey="publishedDate" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
        <Filter.View filterKey="status" inDialog>
          <SelectStatus.FilterView />
        </Filter.View>
        <Filter.View filterKey="type" inDialog>
          <Filter.DialogStringView filterKey="type" />
        </Filter.View>
        <Filter.View filterKey="categories" inDialog>
          <SelectCategories.FilterView clientPortalId={clientPortalId || ''} />
        </Filter.View>
        <Filter.View filterKey="tags" inDialog>
          <SelectTags.FilterView clientPortalId={clientPortalId || ''} />
        </Filter.View>
        <Filter.View filterKey="created" inDialog>
          <Filter.DialogDateView filterKey="created" />
        </Filter.View>
        <Filter.View filterKey="updated" inDialog>
          <Filter.DialogDateView filterKey="updated" />
        </Filter.View>
        <Filter.View filterKey="publishedDate" inDialog>
          <Filter.DialogDateView filterKey="publishedDate" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const PostsFilter = ({ clientPortalId }: { clientPortalId: string }) => {
  const [searchValue] = useFilterQueryState<string>('searchValue');
  const [type] = useFilterQueryState<string>('type');
  const { sessionKey } = useIsPostsLeadSessionKey();

  return (
    <Filter id="posts-filter" sessionKey={sessionKey}>
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
        <SelectStatus.FilterBar />
        <Filter.BarItem queryKey="type">
          <Filter.BarName>
            <IconLabel />
            Type
          </Filter.BarName>
          <Filter.BarButton filterKey="type" inDialog>
            {type}
          </Filter.BarButton>
        </Filter.BarItem>
        <SelectTags.FilterBar clientPortalId={clientPortalId || undefined} />
        <SelectCategories.FilterBar
          clientPortalId={clientPortalId || undefined}
        />
        <Filter.BarItem queryKey="created">
          <Filter.BarName>
            <IconCalendarPlus />
            Created At
          </Filter.BarName>
          <Filter.Date filterKey="created" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="updated">
          <Filter.BarName>
            <IconCalendarUp />
            Updated At
          </Filter.BarName>
          <Filter.Date filterKey="updated" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="publishedDate">
          <Filter.BarName>
            <IconCalendarPlus />
            Publish Date
          </Filter.BarName>
          <Filter.Date filterKey="publishedDate" />
        </Filter.BarItem>
        <PostsFilterPopover clientPortalId={clientPortalId || undefined} />
        <PostsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
