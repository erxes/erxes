import type { TrashItem, User } from '@erxes/core-contract';
import { IconRestore, IconTrash, IconTrashX } from '@tabler/icons-react';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Checkbox,
  Empty,
  PageContainer,
  PageHeader,
  RelativeDateDisplay,
  ScrollArea,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '~/lib/api';
import { actorLabel, useMembersById } from '~/lib/members';
import { useCan } from '~/modules/auth/session';

const useTrashActions = (onDone: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'recycle-bin' });
  const { toast } = useToast();
  const client = useQueryClient();

  const refresh = () => {
    onDone();
    void client.invalidateQueries({ queryKey: orpc.trash.key() });
    void client.invalidateQueries({ queryKey: orpc.customers.key() });
    void client.invalidateQueries({ queryKey: orpc.companies.key() });
  };

  const onError = (error: Error) =>
    toast({
      variant: 'destructive',
      title: t('failed', 'Something went wrong'),
      description: messageOf(error),
    });

  const restore = useMutation(
    orpc.trash.restore.mutationOptions({
      onSuccess: ({ restored, failed }) => {
        toast({
          title: t('restored', '{{count}} restored', { count: restored }),
          description: failed.length ? failed.map((item) => item.reason).join('; ') : undefined,
          variant: failed.length ? 'destructive' : 'default',
        });
        refresh();
      },
      onError,
    }),
  );

  const purge = useMutation(orpc.trash.purge.mutationOptions({ onSuccess: refresh, onError }));

  return { restore, purge };
};

const TrashRow = ({
  item,
  members,
  checked,
  onCheckedChange,
}: {
  item: TrashItem;
  members: Map<string, User>;
  checked: boolean;
  onCheckedChange: (on: boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'recycle-bin' });
  const label = item.label ?? item.recordId;

  return (
    <li className="flex items-center gap-3 p-3 text-sm">
      <Checkbox aria-label={label} checked={checked} onCheckedChange={onCheckedChange} />
      <Badge variant="secondary">
        {item.recordType === 'customer' ? t('customer', 'Customer') : t('company', 'Company')}
      </Badge>
      <span className="font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">
        {[
          t('count-tags', {
            count: item.counts.tags,
            defaultValue_one: '{{count}} tag',
            defaultValue_other: '{{count}} tags',
          }),
          t('count-links', {
            count: item.counts.links,
            defaultValue_one: '{{count}} link',
            defaultValue_other: '{{count}} links',
          }),
          t('count-activities', {
            count: item.counts.activities,
            defaultValue_one: '{{count}} timeline entry',
            defaultValue_other: '{{count}} timeline entries',
          }),
        ].join(' · ')}
      </span>
      <span className="ml-auto text-xs text-muted-foreground">
        {actorLabel(item.deletedBy, members)} ·{' '}
        <RelativeDateDisplay value={item.deletedAt} render={<span />}>
          <RelativeDateDisplay.Value value={item.deletedAt} />
        </RelativeDateDisplay>
      </span>
    </li>
  );
};

const TrashList = ({
  items,
  selected,
  onToggle,
}: {
  items: TrashItem[];
  selected: Set<string>;
  onToggle: (id: string, on: boolean) => void;
}) => {
  const members = useMembersById(
    items.map((item) => (item.deletedBy.type === 'user' ? item.deletedBy.id : null)),
  );

  return (
    <ul className="divide-y rounded-lg border">
      {items.map((item) => (
        <TrashRow
          key={item.id}
          item={item}
          members={members}
          checked={selected.has(item.id)}
          onCheckedChange={(on) => onToggle(item.id, on)}
        />
      ))}
    </ul>
  );
};

const EmptyBin = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'recycle-bin' });

  return (
    <Empty className="py-16">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconTrash />
        </Empty.Media>
        <Empty.Title>{t('empty', 'The recycle bin is empty')}</Empty.Title>
      </Empty.Header>
    </Empty>
  );
};

/**
 * Settings › Recycle bin: deleted customers and companies, restorable with
 * their tags, links and timeline for 30 days; owners can delete for good.
 */
export const RecycleBinPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'recycle-bin' });
  const can = useCan();
  const { confirm } = useConfirm();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { restore, purge } = useTrashActions(() => setSelected(new Set()));

  const trash = useQuery(
    orpc.trash.list.queryOptions({ input: can('contacts.delete') ? { limit: 500 } : skipToken }),
  );

  if (!can('contacts.delete')) return <Navigate to="/settings" replace />;

  const toggle = (id: string, on: boolean) =>
    setSelected((current) => {
      const next = new Set(current);

      if (on) next.add(id);
      else next.delete(id);

      return next;
    });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('title', 'Recycle bin'), to: '/settings/recycle-bin', icon: IconTrash },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          <Button
            variant="outline"
            disabled={!selected.size || restore.isPending}
            onClick={() => restore.mutate({ ids: [...selected] })}
          >
            <IconRestore />
            {t('restore', 'Restore')}
          </Button>
          {can('trash.purge') && (
            <Button
              variant="outline"
              className="text-destructive"
              disabled={!selected.size || purge.isPending}
              onClick={() =>
                void confirm({
                  message: t('purge-confirm', 'Delete these for good? This can’t be undone.'),
                }).then(() => purge.mutate({ ids: [...selected] }))
              }
            >
              <IconTrashX />
              {t('purge', 'Delete for good')}
            </Button>
          )}
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl p-6">
          <p className="mb-4 text-sm text-muted-foreground">
            {t(
              'intro',
              'Deleted customers and companies stay here for 30 days. Restoring brings back their tags, company links and timeline.',
            )}
          </p>
          <QueryState
            query={trash}
            className="py-12"
            isEmpty={({ data }) => !data.length}
            empty={<EmptyBin />}
          >
            {({ data }) => <TrashList items={data} selected={selected} onToggle={toggle} />}
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
