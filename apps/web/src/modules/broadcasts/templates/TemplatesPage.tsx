import type { EmailTemplateItem } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconPlus, IconSpeakerphone, IconTemplate, IconTrash } from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  AppBreadcrumb,
  Button,
  Empty,
  Input,
  PageContainer,
  PageHeader,
  Popover,
  ScrollArea,
  Spinner,
  useFormat,
} from 'erxes-ui';
import { useDeferredValue, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { forwardPaging } from '~/lib/cursorList';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { flattenPages, LoadMore, SearchBar } from '../BroadcastBits';
import { useCreateTemplate, useRemoveTemplate } from './useEmailTemplates';

/** A template in the list: its name opens it; those who manage broadcasts can delete it. */
const TemplateRow = ({ row, canManage }: { row: EmailTemplateItem; canManage: boolean }) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'templates' });
  const fmt = useFormat();
  const { remove, pending } = useRemoveTemplate();

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <IconTemplate className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <Link to={paths.broadcasts.template(row.id)} className="min-w-0 flex-1 hover:underline">
        <span className="block truncate font-medium">{row.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {t('changed', 'Changed {{when}}', { when: fmt.relative(row.updatedAt) })}
        </span>
      </Link>
      {canManage && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('delete', 'Delete')}
          disabled={pending}
          onClick={() => remove(row)}
        >
          <IconTrash />
        </Button>
      )}
    </li>
  );
};

/** "New template": a name first, then the template opens to be written. */
const NewTemplateButton = () => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'templates' });
  const id = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const { create, pending } = useCreateTemplate();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger render={<Button />}>
        <IconPlus />
        {t('new', 'New template')}
      </Popover.Trigger>
      <Popover.Content align="end" className="w-80">
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            create(name);
          }}
        >
          <label htmlFor={id} className="text-sm font-medium">
            {t('name', 'Name')}
          </label>
          <Input
            id={id}
            value={name}
            maxLength={100}
            placeholder={t('name-placeholder', 'Monthly newsletter')}
            onChange={(event) => setName(event.target.value)}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!name.trim() || pending}>
              {pending && <Spinner size="sm" />}
              {t('create', 'Create')}
            </Button>
          </div>
        </form>
      </Popover.Content>
    </Popover>
  );
};

const NoTemplates = () => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'templates' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconTemplate />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No templates yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'Keep a message you send often as a template: start one here, or save an email’s message from its Templates button.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

/** Messages kept to start emails from (self-hosted): open one to change it. */
export const TemplatesPage = () => {
  const { t } = useTranslation('broadcasts');
  const canManage = useCan()('broadcasts.manage');
  const [q, setQ] = useState('');
  const search = useDeferredValue(q.trim());

  const list = useInfiniteQuery(
    orpc.emailTemplates.list.infiniteOptions({
      ...forwardPaging(50),
      input: (page) => ({ ...page, search: search || undefined }),
      select: flattenPages,
    }),
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Broadcasts'),
                to: paths.broadcasts.list,
                icon: IconSpeakerphone,
              },
              { label: t('templates.title', 'Templates'), to: paths.broadcasts.templates },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>{canManage && <NewTemplateButton />}</PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-3 p-6">
          <SearchBar
            value={q}
            onChange={setQ}
            label={t('templates.search-list', 'Search templates')}
          />
          <QueryState
            query={list}
            className="py-12"
            isEmpty={({ rows }) => !rows.length}
            empty={<NoTemplates />}
          >
            {({ rows }) => (
              <div className="overflow-hidden rounded-lg border">
                <ul className="divide-y">
                  {rows.map((row) => (
                    <TemplateRow key={row.id} row={row} canManage={canManage} />
                  ))}
                </ul>
                <LoadMore query={list} />
              </div>
            )}
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
