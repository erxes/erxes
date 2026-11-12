import { IconRestore, IconTrash, IconTrashX } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Checkbox,
  Empty,
  PageContainer,
  RelativeDateDisplay,
  ScrollArea,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { api, messageOf } from '~/lib/api';
import { actorLabel, useMembersById } from '~/lib/members';
import { useCan } from '~/modules/auth/session';

const KEY = ['trash'];

/**
 * Settings › Recycle bin: deleted customers and companies, restorable with
 * their tags, links and timeline for 30 days; owners can delete for good.
 */
export const RecycleBinPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'recycle-bin' });
  const can = useCan();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const client = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () => api.trash.list({ limit: 500 }),
    enabled: can('contacts.delete'),
  });
  const members = useMembersById(
    (data?.data ?? []).map((item) => (item.deletedBy.type === 'user' ? item.deletedBy.id : null)),
  );
  const done = () => {
    setSelected(new Set());
    void client.invalidateQueries({ queryKey: KEY });
    void client.invalidateQueries({ queryKey: ['customers'] });
    void client.invalidateQueries({ queryKey: ['companies'] });
  };
  const onError = (error: unknown) =>
    toast({
      variant: 'destructive',
      title: t('failed', 'Something went wrong'),
      description: messageOf(error),
    });
  const restore = useMutation({
    mutationFn: () => api.trash.restore({ ids: [...selected] }),
    onSuccess: (result) => {
      toast({
        title: t('restored', '{{count}} restored', { count: result.restored }),
        description: result.failed.length
          ? result.failed.map((item) => item.reason).join('; ')
          : undefined,
        variant: result.failed.length ? 'destructive' : 'default',
      });
      done();
    },
    onError,
  });
  const purge = useMutation({
    mutationFn: () => api.trash.purge({ ids: [...selected] }),
    onSuccess: done,
    onError,
  });

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
            onClick={() => restore.mutate()}
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
                }).then(() => purge.mutate())
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
          {isLoading ? (
            <Spinner containerClassName="py-12" />
          ) : !data?.data.length ? (
            <Empty className="py-16">
              <Empty.Header>
                <Empty.Media variant="icon">
                  <IconTrash />
                </Empty.Media>
                <Empty.Title>{t('empty', 'The recycle bin is empty')}</Empty.Title>
              </Empty.Header>
            </Empty>
          ) : (
            <ul className="divide-y rounded-lg border">
              {data.data.map((item) => (
                <li key={item.id} className="flex items-center gap-3 p-3 text-sm">
                  <Checkbox
                    checked={selected.has(item.id)}
                    onCheckedChange={(on) => toggle(item.id, on === true)}
                  />
                  <Badge variant="secondary">
                    {item.recordType === 'customer'
                      ? t('customer', 'Customer')
                      : t('company', 'Company')}
                  </Badge>
                  <span className="font-medium">{item.label ?? item.recordId}</span>
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
                    <RelativeDateDisplay value={item.deletedAt} asChild>
                      <span>
                        <RelativeDateDisplay.Value value={item.deletedAt} />
                      </span>
                    </RelativeDateDisplay>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
