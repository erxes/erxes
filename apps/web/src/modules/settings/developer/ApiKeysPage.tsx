import type { ApiKey } from '@erxes/core-contract';
import { IconKey, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Empty,
  PageContainer,
  PageHeader,
  ScrollArea,
  Table,
  useConfirm,
  useFormat,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { ShownOnce } from '~/components/ShownOnce';
import { paths } from '~/lib/paths';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useCan } from '~/modules/auth/session';
import { NewApiKey } from './NewApiKey';

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

const KeyTable = ({ keys, everyone }: { keys: ApiKey[]; everyone: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const fmt = useFormat();
  const revoke = useRevoke();

  return (
    <Table variant="card" className="overflow-hidden">
      <Table.Header>
        <Table.Row>
          <Table.Head>{t('name', 'Name')}</Table.Head>
          {everyone && <Table.Head>{t('member', 'Member')}</Table.Head>}
          <Table.Head>{t('created', 'Created')}</Table.Head>
          <Table.Head>{t('last-used', 'Last used')}</Table.Head>
          <Table.Head>{t('expires', 'Expires')}</Table.Head>
          <Table.Head className="w-12" />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {keys.map((key) => (
          <Table.Row key={key.id}>
            <Table.Cell>
              <span className="font-medium">{key.name}</span>
            </Table.Cell>
            {everyone && (
              <Table.Cell>
                <span className="text-muted-foreground">{key.memberName ?? key.memberEmail}</span>
              </Table.Cell>
            )}
            <Table.Cell>{fmt.date(key.createdAt)}</Table.Cell>
            <Table.Cell>
              {key.lastUsedAt ? fmt.date(key.lastUsedAt) : t('unused', 'Never')}
            </Table.Cell>
            <Table.Cell>{key.expiresAt ? fmt.date(key.expiresAt) : t('never', 'Never')}</Table.Cell>
            <Table.Cell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('revoke', 'Revoke')}
                onClick={() => revoke(key)}
              >
                <IconTrash />
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

/** Settings › API keys: keys that let a script call the API as the member who made them. */
export const ApiKeysPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const can = useCan();
  const [key, setKey] = useState<string | null>(null);
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
          {can('api_keys.create') && <NewApiKey onCreated={setKey} />}
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-3 p-6">
          <p className="text-sm text-muted-foreground">
            {t(
              'intro',
              'Send a key as "Authorization: Bearer <key>". It can call what its member can, and stops working when it expires, is revoked, or the member is disabled.',
            )}
          </p>
          <QueryState
            query={keys}
            className="py-12"
            isEmpty={({ data }) => !data.length}
            empty={<NoKeys />}
          >
            {({ data }) => <KeyTable keys={data} everyone={can('api_keys.manage')} />}
          </QueryState>
        </div>
      </ScrollArea>
      {key && (
        <ShownOnce
          value={key}
          title={t('key-title', 'Your API key')}
          description={t('key-description', "Copy it now: it won't be shown again.")}
          onClose={() => setKey(null)}
        />
      )}
    </PageContainer>
  );
};
