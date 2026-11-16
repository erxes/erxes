import type { PaymentGateway } from '@erxes/core-contract';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Dialog, Input, Label, Spinner, Switch, useConfirm, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { GATEWAY_NAMES } from './gatewayCatalog';
import { CredentialsHelp, gatewayConfigOf, GatewayFields, type GatewayValues } from './GatewayForm';

/** The settings shown for a gateway, as the form's starting values (credentials stay empty). */
const shownValues = (gateway: PaymentGateway): GatewayValues =>
  Object.fromEntries(
    Object.entries(gateway.settings).filter(
      (entry): entry is [string, string | boolean] =>
        typeof entry[1] === 'string' || typeof entry[1] === 'boolean',
    ),
  );

const useGatewayChanges = (onDone: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const { toast } = useToast();
  const client = useQueryClient();

  const done = () => {
    void client.invalidateQueries({ queryKey: orpc.payments.key() });
    onDone();
  };

  const failed = (title: string) => (error: Error) =>
    toast({ variant: 'destructive', title, description: messageOf(error) });

  return {
    update: useMutation(
      orpc.payments.updateGateway.mutationOptions({
        onSuccess: done,
        onError: failed(t('save-failed', 'Could not save')),
      }),
    ),
    remove: useMutation(
      orpc.payments.removeGateway.mutationOptions({
        onSuccess: done,
        onError: failed(t('remove-failed', 'Could not remove')),
      }),
    ),
  };
};

/** Mounted while the dialog is open, so closing it clears typed credentials. */
const EditGatewayForm = ({ gateway, onDone }: { gateway: PaymentGateway; onDone: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const id = useId();
  const { confirm } = useConfirm();
  // Only what the member typed is state; the rest reads from the gateway as it is now.
  const [typedName, setName] = useState<string | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [typed, setTyped] = useState<GatewayValues>({});
  const name = typedName ?? gateway.name;
  const values = { ...shownValues(gateway), ...typed };
  const { update, remove } = useGatewayChanges(onDone);
  const config = gatewayConfigOf(gateway.kind, values);
  const ready = name.trim() !== '' && (!replacing || config.success);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();

        if (!ready) return;

        update.mutate({
          id: gateway.id,
          name: name.trim(),
          ...(replacing && config.success ? { config: config.data } : {}),
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-name`}>{t('name', 'Name')}</Label>
        <Input id={`${id}-name`} value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Switch id={`${id}-replace`} checked={replacing} onCheckedChange={setReplacing} />
        <Label htmlFor={`${id}-replace`} variant="option">
          {t('replace-credentials', 'Replace the credentials')}
        </Label>
      </div>
      {replacing && (
        <div className="space-y-3 rounded-lg border p-3">
          <CredentialsHelp kind={gateway.kind} />
          <GatewayFields
            kind={gateway.kind}
            values={values}
            onChange={(key, value) => setTyped({ ...typed, [key]: value })}
          />
        </div>
      )}
      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          tone="destructive"
          disabled={remove.isPending}
          onClick={() =>
            void confirm({
              message: t('remove-confirm', 'Remove “{{name}}”?', { name: gateway.name }),
              options: {
                description: t(
                  'remove-description',
                  'Plugins stop using it. A gateway with invoices can only be turned off.',
                ),
                okLabel: t('remove', 'Remove'),
                variants: { ok: 'destructive' },
              },
            }).then(() => remove.mutate({ id: gateway.id }))
          }
        >
          <IconTrash />
          {t('remove', 'Remove')}
        </Button>
        <Button type="submit" className="ml-auto" disabled={update.isPending || !ready}>
          {update.isPending ? <Spinner size="sm" /> : t('save', 'Save')}
        </Button>
      </div>
    </form>
  );
};

/** Rename a gateway, replace its credentials (checked with the gateway again) or remove it. */
export const EditGateway = ({ gateway }: { gateway: PaymentGateway }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <Button
            size="icon"
            variant="ghost"
            aria-label={t('edit-named', 'Edit {{name}}', { name: gateway.name })}
          />
        }
      >
        <IconPencil />
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('edit-title', 'Edit {{name}}', { name: GATEWAY_NAMES[gateway.kind] })}
          description={t('edit-description', 'Rename it, replace its credentials or remove it.')}
        />
        {open && <EditGatewayForm gateway={gateway} onDone={() => setOpen(false)} />}
      </Dialog.Content>
    </Dialog>
  );
};
