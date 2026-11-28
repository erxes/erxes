import type { PortalKey, PortalKeyKind } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconCopy, IconKey, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Dialog,
  Input,
  Label,
  Select,
  useConfirm,
  useFormat,
  useToast,
} from 'erxes-ui';
import { type ReactNode, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';

const useKeyChange = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'portal-keys' });
  const { toast } = useToast();
  const client = useQueryClient();

  return {
    refresh: () => client.invalidateQueries({ queryKey: orpc.portals.keys.key() }),
    failed: (failure: Error) =>
      toast({
        variant: 'destructive',
        title: t('failed', 'Not saved'),
        description: messageOf(failure),
      }),
  };
};

/** A button that copies a key. */
const CopyKey = ({ value }: { value: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portal-keys' });
  const { toast } = useToast();

  return (
    <Button
      variant="outline"
      onClick={() =>
        void navigator.clipboard
          .writeText(value)
          .then(() => toast({ title: t('copied', 'Copied') }))
      }
    >
      <IconCopy />
      {t('copy', 'Copy')}
    </Button>
  );
};

/** The new secret key, shown once, with a button that copies it. */
const NewSecret = ({ secret }: { secret: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portal-keys' });

  return (
    <Alert>
      <Alert.Title>{t('key-once', 'Copy the key now: it shows only once')}</Alert.Title>
      <Alert.Description>
        <span className="mb-2 flex w-full gap-2">
          <Input
            readOnly
            value={secret}
            aria-label={t('key', 'Portal key')}
            className="min-w-0 flex-1"
          />
          <CopyKey value={secret} />
        </span>
        {t(
          'key-use',
          'Keep it on the portal’s server. It trades it at POST /core/v1/portal-auth/token for a 15-minute token and sends that to plugins as X-Portal-Token.',
        )}
      </Alert.Description>
    </Alert>
  );
};

/** What the app made: a secret key's secret shows once, a publishable key stays in the list. */
export interface MadePortalKey {
  kind: PortalKeyKind;
  secret: string;
}

const useKindLabels = (): Record<PortalKeyKind, { label: string; description: string }> => {
  const { t } = useTranslation('settings', { keyPrefix: 'portal-keys' });

  return {
    publishable: {
      label: t('kind-publishable', 'Publishable: for a website or mobile app'),
      description: t(
        'kind-publishable-description',
        'Goes inside the app, where anyone can read it. Browsers may use it only from the portal’s web addresses, and plugins limit each visitor. You can copy it any time.',
      ),
    },
    secret: {
      label: t('kind-secret', 'Secret: for the portal’s server'),
      description: t(
        'kind-secret-description',
        'Stays on your server and never reaches a browser or an app. It shows once.',
      ),
    },
  };
};

/** Which kind of key: publishable for apps, secret for a server, with what that means. */
const KindPicker = ({
  kind,
  onChange,
}: {
  kind: PortalKeyKind;
  onChange: (kind: PortalKeyKind) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portal-keys' });
  const kinds = useKindLabels();

  return (
    <div className="space-y-1.5">
      <Select value={kind} onValueChange={onChange}>
        <Select.Trigger aria-label={t('kind', 'Kind')}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {(['publishable', 'secret'] as const).map((value) => (
            <Select.Item key={value} value={value}>
              {kinds[value].label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <p className="text-xs text-muted-foreground">{kinds[kind].description}</p>
    </div>
  );
};

/** A new portal key: its kind, name and the portal it is for. Mounted while the dialog is open. */
const NewPortalKeyForm = ({ onCreated }: { onCreated: (made: MadePortalKey) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portal-keys' });
  const nameId = useId();
  const portals = useQuery(orpc.portals.list.queryOptions());
  const { refresh, failed } = useKeyChange();
  const [name, setName] = useState('');
  const [portalId, setPortalId] = useState('');
  const [kind, setKind] = useState<PortalKeyKind>('publishable');
  const list = portals.data?.data ?? [];

  const create = useMutation(
    orpc.portals.createKey.mutationOptions({
      onSuccess: (made) => {
        void refresh();
        onCreated({ kind: made.kind, secret: made.secret });
      },
      onError: failed,
    }),
  );

  if (!portals.isPending && !list.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('no-portals', 'A portal key is for a portal: add one first in')}{' '}
        <Link className="underline" to={paths.settings.portals}>
          {t('portals', 'Settings › Portals')}
        </Link>
      </p>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        create.mutate({ id: portalId, name, kind });
      }}
    >
      <KindPicker kind={kind} onChange={setKind} />
      <div className="space-y-1.5">
        <Label htmlFor={nameId}>{t('name', 'Name')}</Label>
        <Input
          id={nameId}
          value={name}
          maxLength={100}
          placeholder={t('name-placeholder', 'What uses it, like "Shop app"')}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <Select value={portalId} onValueChange={setPortalId}>
        <Select.Trigger aria-label={t('portal', 'Portal')}>
          <Select.Value placeholder={t('portal-pick', 'Pick the portal it is for')} />
        </Select.Trigger>
        <Select.Content>
          {list.map((portal) => (
            <Select.Item key={portal.id} value={portal.id}>
              {portal.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <Button
        type="submit"
        className="w-full"
        disabled={!name.trim() || !portalId || create.isPending}
      >
        {t('add', 'Create portal key')}
      </Button>
    </form>
  );
};

/** Creates a portal key in a dialog; the secret shows on the page after. */
export const NewPortalKey = ({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (made: MadePortalKey) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portal-keys' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('add', 'Create portal key')}
          description={t(
            'add-description',
            'For a portal’s apps or server: it reaches the portal’s plugins only for what its customers and visitors may see, never as a team member.',
          )}
        />
        {open && (
          <NewPortalKeyForm
            onCreated={(made) => {
              onOpenChange(false);
              onCreated(made);
            }}
          />
        )}
      </Dialog.Content>
    </Dialog>
  );
};

const KeyRow = ({ apiKey }: { apiKey: PortalKey & { portalName: string } }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portal-keys' });
  const fmt = useFormat();
  const { confirm } = useConfirm();
  const { refresh, failed } = useKeyChange();

  const revoke = useMutation(
    orpc.portals.removeKey.mutationOptions({ onSuccess: () => void refresh(), onError: failed }),
  );

  return (
    <li className="flex items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm">
      <IconKey className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{apiKey.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          <Link className="hover:underline" to={paths.settings.portalOf(apiKey.portalId)}>
            {apiKey.portalName}
          </Link>{' '}
          ·{' '}
          {apiKey.kind === 'publishable'
            ? t('kind-publishable-short', 'Publishable')
            : t('kind-secret-short', 'Secret')}{' '}
          · …{apiKey.hint} ·{' '}
          {apiKey.lastUsedAt
            ? t('key-used', 'Used {{when}}', { when: fmt.dateTime(apiKey.lastUsedAt) })
            : t('key-unused', 'Never used')}
        </span>
      </span>
      {apiKey.key && <CopyKey value={apiKey.key} />}
      <Button
        variant="ghost"
        tone="destructive"
        disabled={revoke.isPending}
        onClick={() =>
          void confirm({
            message: t('revoke-confirm', 'Revoke “{{name}}”? Its tokens stop within 15 minutes.', {
              name: apiKey.name,
            }),
          }).then(() => revoke.mutate({ id: apiKey.portalId, keyId: apiKey.id }))
        }
      >
        <IconTrash />
        {t('revoke', 'Revoke')}
      </Button>
    </li>
  );
};

/** Settings › API keys › Portal keys: every portal's keys, and the one just made. */
export const PortalKeys = ({ secret, empty }: { secret: string | null; empty: ReactNode }) => {
  const keys = useQuery(orpc.portals.keys.queryOptions());

  return (
    <div className="mx-auto max-w-4xl space-y-3 p-3">
      {secret && <NewSecret secret={secret} />}
      <QueryState query={keys} isEmpty={({ data }) => !data.length} empty={empty}>
        {({ data }) => (
          <ul className="space-y-2">
            {data.map((apiKey) => (
              <KeyRow key={apiKey.id} apiKey={apiKey} />
            ))}
          </ul>
        )}
      </QueryState>
    </div>
  );
};
