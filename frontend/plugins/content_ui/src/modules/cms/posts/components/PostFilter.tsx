import {
  IconCalendarPlus,
  IconCalendarUp,
  IconCategory,
  IconHash,
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
import { TagsFilter } from 'ui-modules';
import { PostsHotKeyScope } from '../types/PostsHotKeyScope';
import { PostsTotalCount } from './PostsTotalCount';
import { useIsPostsLeadSessionKey } from '../hooks/usePostsLeadSessionKey';

const PostsFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    tags: string[];
    searchValue: string;
    status: string;
    type: string;
    categories: string;
    createdAt: string;
    updatedAt: string;
    publishedDate: string;
  }>([
    'tags',
    'searchValue',
    'status',
    'type',
    'categories',
    'createdAt',
    'updatedAt',
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
                placeholder="Search ..."
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  Search
                </Filter.Item>
                <Filter.Item value="status">
                  <IconHash />
                  Status
                </Filter.Item>
                <Filter.Item value="type">
                  <IconLabel />
                  Type
                </Filter.Item>
                <TagsFilter />
                <Filter.Item value="categories">
                  <IconCategory />
                  Categories
                </Filter.Item>
                <Command.Separator className="my-1" />
                <Filter.Item value="createdAt">
                  <IconCalendarPlus />
                  Created At
                </Filter.Item>
                <Filter.Item value="updatedAt">
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
          <TagsFilter.View tagType="core:posts" />
          <Filter.View filterKey="createdAt">
            <Filter.DateView filterKey="createdAt" />
          </Filter.View>
          <Filter.View filterKey="updatedAt">
            <Filter.DateView filterKey="updatedAt" />
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
          <Filter.DialogStringView filterKey="status" />
        </Filter.View>
        <Filter.View filterKey="type" inDialog>
          <Filter.DialogStringView filterKey="type" />
        </Filter.View>
        <Filter.View filterKey="categories" inDialog>
          <Filter.DialogStringView filterKey="categories" />
        </Filter.View>
        <Filter.View filterKey="createdAt" inDialog>
          <Filter.DialogDateView filterKey="createdAt" />
        </Filter.View>
        <Filter.View filterKey="updatedAt" inDialog>
          <Filter.DialogDateView filterKey="updatedAt" />
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
  const [status] = useFilterQueryState<string>('status');
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
        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconHash />
            Status
          </Filter.BarName>
          <Filter.BarButton filterKey="status" inDialog>
            {status}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="type">
          <Filter.BarName>
            <IconLabel />
            Type
          </Filter.BarName>
          <Filter.BarButton filterKey="type" inDialog>
            {type}
          </Filter.BarButton>
        </Filter.BarItem>
        <TagsFilter.Bar tagType="core:posts" />
        <Filter.BarItem queryKey="createdAt">
          <Filter.BarName>
            <IconCalendarPlus />
            Created At
          </Filter.BarName>
          <Filter.Date filterKey="createdAt" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="updatedAt">
          <Filter.BarName>
            <IconCalendarUp />
            Updated At
          </Filter.BarName>
          <Filter.Date filterKey="updatedAt" />
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
