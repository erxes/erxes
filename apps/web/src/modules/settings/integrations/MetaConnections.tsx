import type { MetaConnection } from '@erxes/core-contract';
import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';
import { IconBrandFacebook, IconBrandInstagram, IconPlugConnected } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Badge, Button, Empty, Spinner, useConfirm, useFormat, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useIntegrationsSaved } from './customMutation';

const useMetaSaved = (onSaved?: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.meta' });

  return useIntegrationsSaved(t('save-failed', 'Could not save'), onSaved, orpc.meta.key());
};

export const ConnectPages = ({ onNotSetUp }: { onNotSetUp: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.meta' });
  const { toast } = useToast();

  const login = useMutation(
    orpc.meta.loginUrl.mutationOptions({
      onSuccess: ({ url }) => window.location.assign(url),
      onError: (error) => {
        if (isApiError(error, 'META_NOT_SET_UP')) onNotSetUp();

        toast({
          variant: 'destructive',
          title: isApiError(error, 'META_NOT_SET_UP')
            ? t('not-set-up', 'Save your Meta app first')
            : t('connect-failed', 'Could not connect'),
          description: messageOf(error),
        });
      },
    }),
  );

  return (
    <Button disabled={login.isPending} onClick={() => login.mutate({})}>
      {login.isPending ? <Spinner size="sm" /> : t('connect', 'Connect pages')}
    </Button>
  );
};

const ConnectionStatus = ({ connection }: { connection: MetaConnection }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.meta' });

  return connection.status === 'healthy' ? (
    <Badge variant="success">{t('status.healthy', 'Working')}</Badge>
  ) : (
    <Badge variant="warning">{t('status.broken', 'Needs repair')}</Badge>
  );
};

const ConnectionActions = ({ connection }: { connection: MetaConnection }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.meta' });
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const repair = useMutation(
    orpc.meta.repair.mutationOptions(
      useMetaSaved(() => toast({ title: t('repaired', 'Connection checked') })),
    ),
  );

  const disconnect = useMutation(
    orpc.meta.disconnect.mutationOptions(
      useMetaSaved(() => toast({ title: t('disconnected', 'Disconnected') })),
    ),
  );

  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={repair.isPending}
        onClick={() => repair.mutate({ id: connection.id })}
      >
        {repair.isPending ? <Spinner size="sm" /> : t('repair', 'Repair')}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        tone="destructive"
        disabled={disconnect.isPending}
        onClick={() =>
          void confirm({
            message: t('disconnect-confirm', 'Disconnect {{name}}?', { name: connection.name }),
            options: {
              description: t(
                'disconnect-description',
                'Its messages and comments stop reaching erxes, and automations that use it fail.',
              ),
            },
          }).then(() => disconnect.mutate({ id: connection.id }))
        }
      >
        {disconnect.isPending ? <Spinner size="sm" /> : t('disconnect', 'Disconnect')}
      </Button>
    </div>
  );
};

const ConnectionRow = ({ connection }: { connection: MetaConnection }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.meta' });
  const fmt = useFormat();
  const KindIcon = connection.kind === 'facebook' ? IconBrandFacebook : IconBrandInstagram;

  return (
    <li className="flex flex-wrap items-center gap-3 p-3 text-sm">
      <KindIcon className="size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{connection.name}</span>
          <Badge variant="secondary">
            {connection.kind === 'facebook'
              ? t('kind.facebook', 'Facebook')
              : t('kind.instagram', 'Instagram')}
          </Badge>
          {connection.username && (
            <span className="truncate text-muted-foreground">@{connection.username}</span>
          )}
          <ConnectionStatus connection={connection} />
        </p>
        {connection.status === 'broken' && connection.statusReason && (
          <p className="text-xs text-warning-text">{connection.statusReason}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('connected-at', 'Connected {{date}}', { date: fmt.date(connection.connectedAt) })}
        </p>
      </div>
      <ConnectionActions connection={connection} />
    </li>
  );
};

const NoConnections = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.meta' });

  return (
    <Empty variant="outline">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconPlugConnected />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No pages connected yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'Connect your Facebook pages and the Instagram accounts linked to them. You pick which ones on Meta’s screen.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

export const MetaConnections = () => {
  const connections = useQuery(orpc.meta.connections.queryOptions({ input: {} }));

  return (
    <QueryState query={connections} isEmpty={({ data }) => !data.length} empty={<NoConnections />}>
      {({ data }) => (
        <ul className="divide-y rounded-lg border">
          {data.map((connection) => (
            <ConnectionRow key={connection.id} connection={connection} />
          ))}
        </ul>
      )}
    </QueryState>
  );
};
