import {
  IconCalendarPlus,
  IconHash,
  IconProgressCheck,
  IconSourceCode,
  IconTag,
} from '@tabler/icons-react';
import {
  Combobox,
  Filter,
  Popover,
  useFilterQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';

import { formatLogContentTypeLabel } from '@/logs/constants/logFilter';
import { LogActionsFilter } from './LogActionFilter';
import { LogContentTypeFilter } from './LogContentTypeFilter';
import { LogSourceFilter } from './LogSourceFilter';
import { LogStatusFilter } from './LogStatusFilter';
import { LogsTotalCount } from '../LogsTotalCount';

export const LogsFilterBar = () => {
  const { t } = useTranslation('common');
  const [status] = useFilterQueryState<string>('status');
  const [source] = useFilterQueryState<string>('source');
  const [action] = useFilterQueryState<string>('action');
  const [contentType] = useFilterQueryState<string>('contentType');
  const [docId] = useFilterQueryState<string>('docId');

  return (
    <>
      <Filter.BarItem queryKey="status">
        <Filter.BarName>
          <IconProgressCheck />
          {t('logs.status', 'Status')}
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton>{status || t('logs.set-value', 'Set value')}</Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <LogStatusFilter />
          </Combobox.Content>
        </Popover>
      </Filter.BarItem>

      <Filter.BarItem queryKey="source">
        <Filter.BarName>
          <IconSourceCode />
          {t('logs.source', 'Source')}
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton>{source || t('logs.set-value', 'Set value')}</Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <LogSourceFilter />
          </Combobox.Content>
        </Popover>
      </Filter.BarItem>

      {source && (
        <Filter.BarItem queryKey="action">
          <Filter.BarName>
            <IconProgressCheck />
            {t('logs.action', 'Action')}
          </Filter.BarName>
          <Popover>
            <Popover.Trigger>
              <Filter.BarButton>{action || t('logs.set-value', 'Set value')}</Filter.BarButton>
            </Popover.Trigger>
            <Combobox.Content>
              <LogActionsFilter />
            </Combobox.Content>
          </Popover>
        </Filter.BarItem>
      )}

      <SelectMember.FilterBar queryKey="userIds" />

      <Filter.BarItem queryKey="contentType">
        <Filter.BarName>
          <IconTag />
          {t('logs.content-type', 'Content Type')}
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton>
              {formatLogContentTypeLabel(contentType) || t('logs.set-value', 'Set value')}
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <LogContentTypeFilter />
          </Combobox.Content>
        </Popover>
      </Filter.BarItem>

      <Filter.BarItem queryKey="docId">
        <Filter.BarName>
          <IconHash />
          {t('logs.document-id', 'Document ID')}
        </Filter.BarName>
        <Filter.BarButton filterKey="docId" inDialog>
          {docId || t('logs.set-value', 'Set value')}
        </Filter.BarButton>
      </Filter.BarItem>

      <Filter.BarItem queryKey="createdAt">
        <Filter.BarName>
          <IconCalendarPlus />
          {t('logs.created-at', 'Created At')}
        </Filter.BarName>
        <Filter.Date filterKey="createdAt" />
      </Filter.BarItem>

      <LogsTotalCount />
    </>
  );
};
