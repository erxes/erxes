import type { IntegrationConnection } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button, Dialog, Input, Label, Spinner, Switch, useConfirm, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Integration } from './catalog';
import {
  ConnectionFieldInputs,
  connectionKeys,
  type ConnectionValues,
  CredentialsHelp,
  shownValues,
  useConnectionsChanged,
} from './ConnectionFields';
import { useIntegrationText } from './IntegrationStatusBadge';

export const useConnectionChanges = (onDone?: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { toast } = useToast();
  const changed = useConnectionsChanged();

  const done = () => {
    void changed();
    onDone?.();
  };

  const failed = (title: string) => (error: Error) =>
    toast({ variant: 'destructive', title, description: messageOf(error) });

  return {
    update: useMutation(
      orpc.integrations.update.mutationOptions({
        onSuccess: done,
        onError: failed(t('save-failed', 'Could not save')),
      }),
    ),
    remove: useMutation(
      orpc.integrations.remove.mutationOptions({
        onSuccess: done,
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
  connection: IntegrationConnection;
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

const EditConnectionForm = ({
  integration,
  connection,
  onDone,
}: {
  integration: Integration;
  connection: IntegrationConnection;
  onDone: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const id = useId();
  const [typedName, setName] = useState<string | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [typed, setTyped] = useState<ConnectionValues>({});
  const name = typedName ?? connection.name;
  const values = { ...shownValues(connection), ...typed };
  const { update, remove } = useConnectionChanges(onDone);
  const { keys, ready: complete } = connectionKeys(integration, values);
  const ready = name.trim() !== '' && (!replacing || complete);
  const target = { key: integration.key, id: connection.id };

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();

        if (!ready) return;

        update.mutate({ ...target, name: name.trim(), ...(replacing ? { keys } : {}) });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-name`}>{t('name', 'Name')}</Label>
        <Input id={`${id}-name`} value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      {integration.fields.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Switch id={`${id}-replace`} checked={replacing} onCheckedChange={setReplacing} />
          <Label htmlFor={`${id}-replace`} variant="option">
            {t('replace-credentials', 'Replace the credentials')}
          </Label>
        </div>
      )}
      {replacing && (
        <div className="space-y-3 rounded-lg border p-3">
          <CredentialsHelp integration={integration} />
          <ConnectionFieldInputs
            integration={integration}
            values={values}
            onChange={(key, value) => setTyped({ ...typed, [key]: value })}
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

export const EditConnection = ({
  integration,
  connection,
}: {
  integration: Integration;
  connection: IntegrationConnection;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { name } = useIntegrationText()(integration);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <Button
            size="icon"
            variant="ghost"
            aria-label={t('edit-named', 'Edit {{name}}', { name: connection.name })}
          />
        }
      >
        <IconPencil />
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('edit-title', 'Edit {{name}}', { name })}
          description={t('edit-description', 'Rename it, replace its credentials or remove it.')}
        />
        {open && (
          <EditConnectionForm
            integration={integration}
            connection={connection}
            onDone={() => setOpen(false)}
          />
        )}
      </Dialog.Content>
    </Dialog>
  );
};
