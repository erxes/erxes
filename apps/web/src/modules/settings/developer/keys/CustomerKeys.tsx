import type { PortalKey } from '@erxes/core-contract';
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
  const { t } = useTranslation('settings', { keyPrefix: 'customer-keys' });
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

/** The new key's secret, shown once, with a button that copies it. */
const NewSecret = ({ secret }: { secret: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'customer-keys' });
  const { toast } = useToast();

  return (
    <Alert>
      <Alert.Title>{t('key-once', 'Copy the key now: it shows only once')}</Alert.Title>
      <Alert.Description>
        <span className="mb-2 flex w-full gap-2">
          <Input
            readOnly
            value={secret}
            aria-label={t('key', 'Customer key')}
            className="min-w-0 flex-1"
          />
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

/** A new customer key: its name and the portal it is for. Mounted while the dialog is open. */
const NewCustomerKeyForm = ({ onCreated }: { onCreated: (secret: string) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'customer-keys' });
  const nameId = useId();
  const portals = useQuery(orpc.portals.list.queryOptions());
  const { refresh, failed } = useKeyChange();
  const [name, setName] = useState('');
  const [portalId, setPortalId] = useState('');
  const list = portals.data?.data ?? [];

  const create = useMutation(
    orpc.portals.createKey.mutationOptions({
      onSuccess: (made) => {
        void refresh();
        onCreated(made.secret);
      },
      onError: failed,
    }),
  );

  if (!portals.isPending && !list.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('no-portals', 'A customer key is for a portal: add one first in')}{' '}
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
        create.mutate({ id: portalId, name });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor={nameId}>{t('name', 'Name')}</Label>
        <Input
          id={nameId}
          value={name}
          maxLength={100}
          placeholder={t('name-placeholder', 'What uses it, like "Shop server"')}
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
        {t('add', 'Create customer key')}
      </Button>
    </form>
  );
};

/** Creates a customer key in a dialog; the secret shows on the page after. */
export const NewCustomerKey = ({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (secret: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'customer-keys' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('add', 'Create customer key')}
          description={t(
            'add-description',
            'For a portal’s own server: it reaches the portal’s plugins only for what its customers and visitors may see, never as a team member.',
          )}
        />
        {open && (
          <NewCustomerKeyForm
            onCreated={(secret) => {
              onOpenChange(false);
              onCreated(secret);
            }}
          />
        )}
      </Dialog.Content>
    </Dialog>
  );
};

const KeyRow = ({ apiKey }: { apiKey: PortalKey & { portalName: string } }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'customer-keys' });
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
          · …{apiKey.hint} ·{' '}
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
          }).then(() => revoke.mutate({ id: apiKey.portalId, keyId: apiKey.id }))
        }
      >
        <IconTrash />
        {t('revoke', 'Revoke')}
      </Button>
    </li>
  );
};

/** Settings › API keys › Customer keys: every portal's keys, and the one just made. */
export const CustomerKeys = ({ secret, empty }: { secret: string | null; empty: ReactNode }) => {
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
