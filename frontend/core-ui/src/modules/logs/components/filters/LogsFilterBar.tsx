import { useState } from 'react';
import {
  IconCalendarPlus,
  IconHash,
  IconProgressCheck,
  IconSourceCode,
  IconTag,
} from '@tabler/icons-react';
import { Combobox, Filter, Popover, useFilterQueryState } from 'erxes-ui';
import { SelectMember } from 'ui-modules';

import { formatLogContentTypeLabel } from '@/logs/constants/logFilter';
import { LogActionsFilter } from './LogActionFilter';
import { LogContentTypeFilter } from './LogContentTypeFilter';
import { LogSourceFilter } from './LogSourceFilter';
import { LogStatusFilter } from './LogStatusFilter';
import { LogsTotalCount } from '../LogsTotalCount';
import { useTranslation } from 'react-i18next';

const LogStatusBarItem = () => {
  const { t } = useTranslation('common', { keyPrefix: 'logs' });
  const [status] = useFilterQueryState<string>('status');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="status">
      <Filter.BarName>
        <IconProgressCheck />
        {t('status-label')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="status">
            {status || t('set-value')}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <LogStatusFilter onValueChange={() => setOpen(false)} />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

const LogSourceBarItem = () => {
  const { t } = useTranslation('common', { keyPrefix: 'logs' });
  const [source] = useFilterQueryState<string>('source');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="source">
      <Filter.BarName>
        <IconSourceCode />
        {t('source')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="source">
            {source || t('set-value')}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <LogSourceFilter onValueChange={() => setOpen(false)} />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

const LogActionBarItem = () => {
  const { t } = useTranslation('common', { keyPrefix: 'logs' });
  const [action] = useFilterQueryState<string>('action');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="action">
      <Filter.BarName>
        <IconProgressCheck />
        {t('action')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="action">
            {action || t('set-value')}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <LogActionsFilter onValueChange={() => setOpen(false)} />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

const LogContentTypeBarItem = () => {
  const { t } = useTranslation('common', { keyPrefix: 'logs' });
  const [contentType] = useFilterQueryState<string>('contentType');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="contentType">
      <Filter.BarName>
        <IconTag />
        {t('content-type')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="contentType">
            {formatLogContentTypeLabel(contentType) || t('set-value')}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <LogContentTypeFilter onValueChange={() => setOpen(false)} />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

export const LogsFilterBar = () => {
  const { t } = useTranslation('common', { keyPrefix: 'logs' });
  const [source] = useFilterQueryState<string>('source');
  const [docId] = useFilterQueryState<string>('docId');

  return (
    <>
      <LogStatusBarItem />
      <LogSourceBarItem />
      {source && <LogActionBarItem />}
      <SelectMember.FilterBar queryKey="userIds" />
      <LogContentTypeBarItem />

      <Filter.BarItem queryKey="docId">
        <Filter.BarName>
          <IconHash />
          {t('document-id')}
        </Filter.BarName>
        <Filter.BarButton filterKey="docId" inDialog>
          {docId || t('set-value')}
        </Filter.BarButton>
      </Filter.BarItem>

      <Filter.BarItem queryKey="createdAt">
        <Filter.BarName>
          <IconCalendarPlus />
          {t('created-at')}
        </Filter.BarName>
        <Filter.Date filterKey="createdAt" />
      </Filter.BarItem>

      <LogsTotalCount />
    </>
  );
};
