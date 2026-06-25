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
import { useTranslation } from 'react-i18next';
import { PostsHotKeyScope } from '../types/PostsHotKeyScope';
import { PostsTotalCount } from './PostsTotalCount';
import { useIsPostsLeadSessionKey } from '../hooks/usePostsLeadSessionKey';
import { SelectStatus } from './selects/SelectStatus';
import { SelectTags } from './selects/SelectTags';
import { SelectCategories } from './selects/SelectCategories';
import { useCustomTypes } from '../../custom-types/hooks/useCustomTypes';

interface PostsFilterPopoverProps {
  clientPortalId?: string;
}

const PostsFilterPopover = ({ clientPortalId }: PostsFilterPopoverProps) => {
  const { t } = useTranslation('content');
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
                placeholder={t('filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('search')}
                </Filter.Item>
                <SelectStatus.FilterItem />
                <Filter.Item value="type" inDialog>
                  <IconLabel />
                  {t('type')}
                </Filter.Item>
                <SelectTags.FilterItem />
                <SelectCategories.FilterItem />
                <Command.Separator className="my-1" />
                <Filter.Item value="created">
                  <IconCalendarPlus />
                  {t('created-at')}
                </Filter.Item>
                <Filter.Item value="updated">
                  <IconCalendarUp />
                  {t('updated-at')}
                </Filter.Item>
                <Filter.Item value="publishedDate">
                  <IconCalendarPlus />
                  {t('publish-date')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectTags.FilterView clientPortalId={clientPortalId || ''} />
          <SelectCategories.FilterView clientPortalId={clientPortalId} />
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
          <SelectCategories.FilterView clientPortalId={clientPortalId} />
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
  const { t } = useTranslation('content');
  const [searchValue] = useFilterQueryState<string>('searchValue');
  const [type] = useFilterQueryState<string>('type');
  const { sessionKey } = useIsPostsLeadSessionKey();
  const { customTypes } = useCustomTypes({ clientPortalId });
  const typeLabel =
    type === 'post'
      ? 'Post'
      : customTypes.find((t) => t.code === type)?.pluralLabel ||
        customTypes.find((t) => t.code === type)?.label ||
        type;

  return (
    <Filter id="posts-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            {t('search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <SelectStatus.FilterBar />
        <Filter.BarItem queryKey="type">
          <Filter.BarName>
            <IconLabel />
            {t('type')}
          </Filter.BarName>
          <Filter.BarButton filterKey="type" inDialog>
            {typeLabel}
          </Filter.BarButton>
        </Filter.BarItem>
        <SelectTags.FilterBar clientPortalId={clientPortalId} />
        <SelectCategories.FilterBar clientPortalId={clientPortalId} />
        <Filter.BarItem queryKey="created">
          <Filter.BarName>
            <IconCalendarPlus />
            {t('created-at')}
          </Filter.BarName>
          <Filter.Date filterKey="created" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="updated">
          <Filter.BarName>
            <IconCalendarUp />
            {t('updated-at')}
          </Filter.BarName>
          <Filter.Date filterKey="updated" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="publishedDate">
          <Filter.BarName>
            <IconCalendarPlus />
            {t('publish-date')}
          </Filter.BarName>
          <Filter.Date filterKey="publishedDate" />
        </Filter.BarItem>
        <PostsFilterPopover clientPortalId={clientPortalId || undefined} />
        <PostsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
