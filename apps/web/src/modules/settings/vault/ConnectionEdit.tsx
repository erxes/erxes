import type { VaultConnection } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconTrash } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button, Spinner, useConfirm, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Integration } from '../integrations/catalog';
import {
  changedKeys,
  ConnectionFieldInputs,
  type ConnectionValues,
  settingsFilled,
  shownValues,
  useConnectionsChanged,
} from '../integrations/ConnectionFields';
import { ConnectionNameInput, useConnectionName } from './ConnectionName';

export const useConnectionChanges = (onRemoved?: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { toast } = useToast();
  const changed = useConnectionsChanged();

  const failed = (title: string) => (error: Error) =>
    toast({ variant: 'destructive', title, description: messageOf(error) });

  return {
    update: useMutation(
      orpc.integrations.update.mutationOptions({
        onSuccess: () => {
          void changed();
          toast({ title: t('saved', 'Saved') });
        },
        onError: failed(t('save-failed', 'Could not save')),
      }),
    ),
    remove: useMutation(
      orpc.integrations.remove.mutationOptions({
        onSuccess: () => {
          void changed();
          onRemoved?.();
        },
        onError: failed(t('remove-failed', 'Could not remove')),
      }),
    ),
  };
};

const RemoveConnection = ({
  integration,
  connection,
  pending,
  onRemove,
}: {
  integration: Integration;
  connection: VaultConnection;
  pending: boolean;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { confirm } = useConfirm();

  return (
    <Button
      type="button"
      variant="ghost"
      tone="destructive"
      disabled={pending}
      onClick={() =>
        void confirm({
          message: t('remove-confirm', 'Remove “{{name}}”?', { name: connection.name }),
          options: {
            description: integration.payments
              ? t(
                  'remove-description',
                  'Plugins stop using it. A gateway with invoices can only be turned off.',
                )
              : undefined,
            okLabel: t('remove', 'Remove'),
            variants: { ok: 'destructive' },
          },
        }).then(onRemove)
      }
    >
      <IconTrash />
      {t('remove', 'Remove')}
    </Button>
  );
};

export const ConnectionEdit = ({
  integration,
  connection,
  onRemoved,
}: {
  integration: Integration;
  connection: VaultConnection;
  onRemoved: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const id = useId();
  const { name, setName, taken, ready: named } = useConnectionName(integration, connection);
  const [typed, setTyped] = useState<ConnectionValues>({});
  const kept = shownValues(connection);
  const values = { ...kept, ...typed };
  const { update, remove } = useConnectionChanges(onRemoved);
  const keys = changedKeys(kept, typed);
  const ready = named && settingsFilled(integration, values);
  const target = { key: integration.key, id: connection.id };

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();

        if (!ready) return;

        update.mutate(
          { ...target, name: name.trim(), ...(Object.keys(keys).length ? { keys } : {}) },
          { onSuccess: () => setTyped({}) },
        );
      }}
    >
      <ConnectionNameInput
        id={`${id}-name`}
        integration={integration}
        name={name}
        taken={taken}
        onChange={setName}
      />
      {integration.fields.length > 0 && (
        <div className="space-y-3 rounded-lg border p-3">
          <ConnectionFieldInputs
            integration={integration}
            values={values}
            secretsKept
            onChange={(key, value) => setTyped((current) => ({ ...current, [key]: value }))}
          />
        </div>
      )}
      <div className="flex items-center gap-2 pt-1">
        <RemoveConnection
          integration={integration}
          connection={connection}
          pending={remove.isPending}
          onRemove={() => remove.mutate(target)}
        />
        <Button type="submit" className="ml-auto" disabled={update.isPending || !ready}>
          {update.isPending ? <Spinner size="sm" /> : t('save', 'Save')}
        </Button>
      </div>
    </form>
  );
};
