import type { PortalKey } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconCopy, IconKey, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Input, useConfirm, useFormat, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';

const useKeyChange = (portalId: string) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const { toast } = useToast();
  const client = useQueryClient();

  return {
    refresh: () =>
      client.invalidateQueries({ queryKey: orpc.portals.keys.key({ input: { id: portalId } }) }),
    failed: (failure: Error) =>
      toast({
        variant: 'destructive',
        title: t('failed', 'Not saved'),
        description: messageOf(failure),
      }),
  };
};

/** The new key's secret, shown once, with a button that copies it. */
const NewSecret = ({ secret }: { secret: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const { toast } = useToast();

  return (
    <Alert>
      <Alert.Title>{t('key-once', 'Copy the key now: it shows only once')}</Alert.Title>
      <Alert.Description>
        <span className="mb-2 flex gap-2">
          <Input readOnly value={secret} aria-label={t('key', 'Server key')} />
          <Button
            variant="outline"
            onClick={() =>
              void navigator.clipboard
                .writeText(secret)
                .then(() => toast({ title: t('copied', 'Copied') }))
            }
          >
            <IconCopy />
            {t('copy', 'Copy')}
          </Button>
        </span>
        {t(
          'key-use',
          'Keep it on the portal’s server. It trades it at POST /core/v1/portal-auth/token for a 15-minute token and sends that to plugins as X-Portal-Token.',
        )}
      </Alert.Description>
    </Alert>
  );
};

const KeyRow = ({ portalId, apiKey }: { portalId: string; apiKey: PortalKey }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const fmt = useFormat();
  const { confirm } = useConfirm();
  const { refresh, failed } = useKeyChange(portalId);

  const revoke = useMutation(
    orpc.portals.removeKey.mutationOptions({ onSuccess: () => void refresh(), onError: failed }),
  );

  return (
    <li className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
      <IconKey className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{apiKey.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          …{apiKey.hint} ·{' '}
          {apiKey.lastUsedAt
            ? t('key-used', 'Used {{when}}', { when: fmt.dateTime(apiKey.lastUsedAt) })
            : t('key-unused', 'Never used')}
        </span>
      </span>
      <Button
        variant="ghost"
        tone="destructive"
        disabled={revoke.isPending}
        onClick={() =>
          void confirm({
            message: t('revoke-confirm', 'Revoke “{{name}}”? Its tokens stop within 15 minutes.', {
              name: apiKey.name,
            }),
          }).then(() => revoke.mutate({ id: portalId, keyId: apiKey.id }))
        }
      >
        <IconTrash />
        {t('revoke', 'Revoke')}
      </Button>
    </li>
  );
};

/** The portal's server keys: its own server trades one for tokens every plugin on it checks. */
export const PortalKeys = ({ portalId }: { portalId: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const keys = useQuery(orpc.portals.keys.queryOptions({ input: { id: portalId } }));
  const { refresh, failed } = useKeyChange(portalId);
  const [name, setName] = useState('');
  const [secret, setSecret] = useState<string | null>(null);

  const create = useMutation(
    orpc.portals.createKey.mutationOptions({
      onSuccess: (made) => {
        setSecret(made.secret);
        setName('');
        void refresh();
      },
      onError: failed,
    }),
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t(
          'keys-intro',
          'For the portal’s own server (server-side rendering, a backend), never for a browser or app. Plugins on the portal accept its tokens; no plugin needs a key of its own.',
        )}
      </p>
      {secret && <NewSecret secret={secret} />}
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate({ id: portalId, name });
        }}
      >
        <Input
          aria-label={t('key-name', 'Key name')}
          value={name}
          maxLength={100}
          placeholder={t('key-name-placeholder', 'What uses it, like "Shop server"')}
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit" disabled={!name.trim() || create.isPending}>
          <IconPlus />
          {t('add-key', 'Make key')}
        </Button>
      </form>
      <QueryState query={keys} isEmpty={({ data }) => !data.length} empty={null}>
        {({ data }) => (
          <ul className="space-y-2">
            {data.map((apiKey) => (
              <KeyRow key={apiKey.id} portalId={portalId} apiKey={apiKey} />
            ))}
          </ul>
        )}
      </QueryState>
    </div>
  );
};
