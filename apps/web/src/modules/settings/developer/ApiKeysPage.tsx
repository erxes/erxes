import type { ApiKey } from '@erxes/core-contract';
import { IconKey, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Empty,
  PageContainer,
  PageHeader,
  ScrollArea,
  useConfirm,
  useFormat,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useCan } from '~/modules/auth/session';
import { useKeyLookups } from './keys/useKeyLookups';
import { useKeyPlugins } from './keys/useKeyPlugins';
import { useKeySentence } from './keys/useKeySentence';

const NoKeys = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconKey />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No API keys yet')}</Empty.Title>
        <Empty.Description>
          {t('empty-description', 'Scripts and other systems call the API with a key.')}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

const useRevoke = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const client = useQueryClient();

  const remove = useMutation(
    orpc.apiKeys.remove.mutationOptions({
      onSuccess: () => client.invalidateQueries({ queryKey: orpc.apiKeys.list.key() }),
      onError: (failure) =>
        toast({
          variant: 'destructive',
          title: t('revoke-failed', 'Could not revoke the key'),
          description: messageOf(failure),
        }),
    }),
  );

  return (key: ApiKey) =>
    void confirm({
      message: t('revoke-confirm', 'Revoke {{name}}? Whatever uses it stops working at once.', {
        name: key.name,
      }),
    }).then(() => remove.mutate({ id: key.id }));
};

/** The key's sentence; a key made before rules says whose rights it has. */
const useKeySummary = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const sentence = useKeySentence();
  const { nameOf } = useKeyLookups();
  const { titled } = useKeyPlugins();

  return (key: ApiKey) =>
    key.kind === 'member'
      ? t('old-key', 'Made before rules: can do everything {{name}} can.', {
          name: key.memberName ?? key.memberEmail,
        })
      : sentence({
          kind: key.kind,
          areas: key.areas,
          plugins: titled(key.pluginAccess),
          actions: key.actions,
          scope: key.ownRecords ? 'own' : key.unitIds.length ? 'units' : 'all',
          unitNames: key.unitIds.map(nameOf),
          tagNames: key.tagIds.map(nameOf),
          ips: key.allowedIps,
          until: key.expiresAt,
        });
};

const KindBadge = ({ kind }: { kind: ApiKey['kind'] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });

  if (kind === 'management')
    return <Badge variant="info">{t('kind.management', 'Management')}</Badge>;

  if (kind === 'regular') return <Badge variant="secondary">{t('kind.regular', 'Regular')}</Badge>;

  return <Badge variant="warning">{t('kind.member', 'Old key')}</Badge>;
};

/** One key: name and kind, what it can do, who made it and when it was last used. */
const KeyRow = ({ apiKey, everyone }: { apiKey: ApiKey; everyone: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const fmt = useFormat();
  const revoke = useRevoke();
  const summary = useKeySummary();

  const lastUsed = apiKey.lastUsedAt
    ? t('used-on', 'Last used {{date}}', { date: fmt.date(apiKey.lastUsedAt) })
    : t('unused', 'Never used');

  return (
    <li className="flex items-start gap-3 rounded-lg border p-4 hover:bg-muted/50">
      <Link to={paths.settings.apiKeyOf(apiKey.id)} className="min-w-0 flex-1 space-y-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-medium">{apiKey.name}</span>
          <KindBadge kind={apiKey.kind} />
        </span>
        <span className="block text-sm text-muted-foreground">{summary(apiKey)}</span>
        <span className="block text-xs text-muted-foreground">
          {everyone
            ? `${t('made-by', 'Made by {{name}}', { name: apiKey.memberName ?? apiKey.memberEmail })} · ${lastUsed}`
            : lastUsed}
        </span>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('revoke', 'Revoke')}
        onClick={() => revoke(apiKey)}
      >
        <IconTrash />
      </Button>
    </li>
  );
};

/** Settings › API keys: the organisation's keys, each with what it can do. */
export const ApiKeysPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const can = useCan();
  const keys = useQuery(orpc.apiKeys.list.queryOptions());

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: t('title', 'API keys'), to: paths.settings.apiKeys, icon: IconKey }]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          {can('api_keys.create') && (
            <Button render={<Link to={paths.settings.apiKeyNew} />}>
              <IconPlus />
              {t('add', 'Create key')}
            </Button>
          )}
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-5xl space-y-3 p-6">
          <p className="text-sm text-muted-foreground">
            {t(
              'intro',
              'Keys let other systems use erxes. A regular key works with data, a management key sets up the organisation. A key never does more than the person who made it.',
            )}
          </p>
          <QueryState
            query={keys}
            className="py-12"
            isEmpty={({ data }) => !data.length}
            empty={<NoKeys />}
          >
            {({ data }) => (
              <ul className="space-y-2">
                {data.map((apiKey) => (
                  <KeyRow key={apiKey.id} apiKey={apiKey} everyone={can('api_keys.manage')} />
                ))}
              </ul>
            )}
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
