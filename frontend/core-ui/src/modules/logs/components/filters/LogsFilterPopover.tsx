import {
  IconCalendarPlus,
  IconHash,
  IconProgressCheck,
  IconSourceCode,
  IconTag,
  IconUser,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  useMultiQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';

import { LogActionsFilter } from './LogActionFilter';
import { LogContentTypeFilter } from './LogContentTypeFilter';
import { LogDocIdFilter } from './LogDocIdFilter';
import { LogSourceFilter } from './LogSourceFilter';
import { LogStatusFilter } from './LogStatusFilter';

export const LogsFilterPopover = () => {
  const { t } = useTranslation('common');
  const [queries] = useMultiQueryState<{
    status: string;
    source: string;
    action: string;
    userIds: string[];
    createdAt: string;
    contentType: string;
    docId: string;
  }>([
    'status',
    'source',
    'action',
    'userIds',
    'createdAt',
    'contentType',
    'docId',
  ]);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope="logs_page">
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter._', 'Filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1 max-h-none">
                <Filter.Item value="status">
                  <IconProgressCheck />
                  {t('logs.status', 'Status')}
                </Filter.Item>
                <Filter.Item value="source">
                  <IconSourceCode />
                  {t('logs.source', 'Source')}
                </Filter.Item>
                {queries?.source && (
                  <Filter.Item value="action">
                    <IconProgressCheck />
                    {t('logs.action', 'Action')}
                  </Filter.Item>
                )}
                <Filter.Item value="userIds">
                  <IconUser />
                  {t('logs.user', 'User')}
                </Filter.Item>
                <Filter.Item value="contentType">
                  <IconTag />
                  {t('logs.content-type', 'Content Type')}
                </Filter.Item>
                <Filter.Item value="docId" inDialog>
                  <IconHash />
                  {t('logs.document-id', 'Document ID')}
                </Filter.Item>
                <Command.Separator className="my-1" />
                <Filter.Item value="createdAt">
                  <IconCalendarPlus />
                  {t('logs.created-at', 'Created At')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <Filter.View filterKey="status">
            <LogStatusFilter />
          </Filter.View>
          <Filter.View filterKey="source">
            <LogSourceFilter />
          </Filter.View>
          <Filter.View filterKey="action">
            <LogActionsFilter />
          </Filter.View>
          <Filter.View filterKey="userIds">
            <SelectMember.FilterView queryKey="userIds" />
          </Filter.View>
          <Filter.View filterKey="contentType">
            <LogContentTypeFilter />
          </Filter.View>
          <Filter.View filterKey="docId">
            <LogDocIdFilter />
          </Filter.View>
          <Filter.View filterKey="createdAt">
            <Filter.DateView filterKey="createdAt" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="docId" inDialog>
          <Filter.DialogStringView filterKey="docId" />
        </Filter.View>
        <Filter.View filterKey="status" inDialog>
          <LogStatusFilter />
        </Filter.View>
        <Filter.View filterKey="source" inDialog>
          <LogSourceFilter />
        </Filter.View>
        {queries?.source && (
          <Filter.View filterKey="action" inDialog>
            <LogActionsFilter />
          </Filter.View>
        )}
        <Filter.View filterKey="contentType" inDialog>
          <LogContentTypeFilter />
        </Filter.View>
        <Filter.View filterKey="createdAt" inDialog>
          <Filter.DialogDateView filterKey="createdAt" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};
