import { useEffect, useRef } from 'react';
import {
  IconCalendarCheck,
  IconCalendarPlus,
  IconCalendarUp,
  IconSearch,
} from '@tabler/icons-react';

import {
  Combobox,
  Command,
  Filter,
  useFilterQueryState,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';
import { PostsHotKeyScope } from '../types/PostsHotKeyScope';
import { PostsTotalCount } from './PostsTotalCount';
import { useIsPostsLeadSessionKey } from '../hooks/usePostsLeadSessionKey';
import { SelectStatus } from './selects/SelectStatus';
import { SelectTags } from './selects/SelectTags';
import { SelectCategories } from './selects/SelectCategories';
import { SelectType } from './selects/SelectType';

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
    categories: string[];
    author: string;
    created: string;
    updated: string;
    publishedDate: string;
  }>([
    'tags',
    'searchValue',
    'status',
    'type',
    'categories',
    'author',
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
                <SelectType.FilterItem />
                <SelectTags.FilterItem />
                <SelectCategories.FilterItem />
                <SelectMember.FilterItem value="author" label={t('author')} />
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
                  <IconCalendarCheck />
                  {t('publish-date')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectTags.FilterView clientPortalId={clientPortalId || ''} />
          <SelectCategories.FilterView clientPortalId={clientPortalId} />
          <SelectMember.FilterView queryKey="author" />
          <SelectStatus.FilterView />
          <Filter.View filterKey="type">
            <SelectType.FilterView clientPortalId={clientPortalId} />
          </Filter.View>
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
          <SelectType.FilterView clientPortalId={clientPortalId} />
        </Filter.View>
        <Filter.View filterKey="categories" inDialog>
          <SelectCategories.FilterView clientPortalId={clientPortalId} />
        </Filter.View>
        <Filter.View filterKey="tags" inDialog>
          <SelectTags.FilterView clientPortalId={clientPortalId || ''} />
        </Filter.View>
        <Filter.View filterKey="author" inDialog>
          <SelectMember.FilterView queryKey="author" />
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
  const { sessionKey } = useIsPostsLeadSessionKey();

  // Enforce mutual exclusivity: setting one date filter clears the other two
  const [created, setCreated] = useQueryState<string>('created');
  const [updated, setUpdated] = useQueryState<string>('updated');
  const [publishedDate, setPublishedDate] = useQueryState<string>('publishedDate');

  const prevCreated = useRef(created);
  const prevUpdated = useRef(updated);
  const prevPublishedDate = useRef(publishedDate);

  // On mount: apply priority (created > updated > publishedDate) to clear conflicts from URL
  useEffect(() => {
    if (created) {
      if (updated) setUpdated(null);
      if (publishedDate) setPublishedDate(null);
    } else if (updated && publishedDate) {
      setPublishedDate(null);
    }
    prevCreated.current = created;
    prevUpdated.current = updated;
    prevPublishedDate.current = publishedDate;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On change: enforce mutual exclusivity
  useEffect(() => {
    if (created !== prevCreated.current && created) {
      setUpdated(null);
      setPublishedDate(null);
    } else if (updated !== prevUpdated.current && updated) {
      setCreated(null);
      setPublishedDate(null);
    } else if (publishedDate !== prevPublishedDate.current && publishedDate) {
      setCreated(null);
      setUpdated(null);
    }
    prevCreated.current = created;
    prevUpdated.current = updated;
    prevPublishedDate.current = publishedDate;
  }, [created, updated, publishedDate]);

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
        <SelectType.FilterBar clientPortalId={clientPortalId || undefined} />
        <SelectTags.FilterBar clientPortalId={clientPortalId} />
        <SelectCategories.FilterBar clientPortalId={clientPortalId} />
        <SelectMember.FilterBar queryKey="author" label={t('author')} />
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
            <IconCalendarCheck />
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
