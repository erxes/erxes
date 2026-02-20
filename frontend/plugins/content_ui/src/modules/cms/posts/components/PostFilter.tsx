import {
  IconCalendarPlus,
  IconCalendarUp,
  IconCategory,
  IconLabel,
  IconSearch,
  IconTag,
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

const PostsFilterPopover = () => {
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
                <Filter.Item value="categories" inDialog>
                  <IconCategory />
                  Categories
                </Filter.Item>
                <Filter.Item value="tags" inDialog>
                  <IconTag />
                  Tags
                </Filter.Item>
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
          <Filter.DialogStringView filterKey="categories" />
        </Filter.View>
        <Filter.View filterKey="tags" inDialog>
          <Filter.DialogStringView filterKey="tags" />
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

export const PostsFilter = () => {
  const [searchValue] = useFilterQueryState<string>('searchValue');
  const [type] = useFilterQueryState<string>('type');
  const { sessionKey } = useIsPostsLeadSessionKey();
  const [tags] = useFilterQueryState<string[]>('tags');
  const [categories] = useFilterQueryState<string[]>('categories');

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
        <Filter.BarItem queryKey="tags">
          <Filter.BarName>Tags</Filter.BarName>
          <Filter.BarButton filterKey="tags" inDialog>
            {tags}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="categories">
          <Filter.BarName>Categories</Filter.BarName>
          <Filter.BarButton filterKey="categories" inDialog>
            {categories}
          </Filter.BarButton>
        </Filter.BarItem>
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
        <PostsFilterPopover />
        <PostsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
