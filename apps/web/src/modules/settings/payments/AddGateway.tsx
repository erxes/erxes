import type { PaymentGatewayKind } from '@erxes/core-contract';
import { IconArrowLeft, IconPlus } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Dialog, Input, Label, ScrollArea, Spinner, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { GATEWAY_NAMES } from './gatewayCatalog';
import { CredentialsHelp, gatewayConfigOf, GatewayFields, type GatewayValues } from './GatewayForm';
import { GatewayPicker } from './GatewayPicker';

const useAddGateway = (onAdded: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const { toast } = useToast();
  const client = useQueryClient();

  return useMutation(
    orpc.payments.addGateway.mutationOptions({
      onSuccess: (gateway) => {
        void client.invalidateQueries({ queryKey: orpc.payments.key() });
        toast({ title: t('added', '{{name}} is connected', { name: gateway.name }) });
        onAdded();
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('add-failed', 'Could not connect'),
          description: messageOf(error),
        }),
    }),
  );
};

/** The second step: a name and the picked gateway's credentials. */
const ConnectForm = ({
  kind,
  onBack,
  onAdded,
}: {
  kind: PaymentGatewayKind;
  /** Back to all gateways; none when the dialog connects one gateway only. */
  onBack?: () => void;
  onAdded: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const id = useId();
  const [name, setName] = useState(GATEWAY_NAMES[kind]);
  const [values, setValues] = useState<GatewayValues>({});
  const add = useAddGateway(onAdded);
  const config = gatewayConfigOf(kind, values);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();

        if (config.success) add.mutate({ name, config: config.data });
      }}
    >
      {onBack && (
        <Button type="button" variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
          <IconArrowLeft />
          {t('all-gateways', 'All gateways')}
        </Button>
      )}
      <CredentialsHelp kind={kind} />
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-name`}>{t('name', 'Name')}</Label>
        <Input id={`${id}-name`} value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <GatewayFields
        kind={kind}
        values={values}
        onChange={(key, value) => setValues({ ...values, [key]: value })}
      />
      <Button
        type="submit"
        className="w-full"
        disabled={add.isPending || !name.trim() || !config.success}
      >
        {add.isPending ? (
          <Spinner size="sm" />
        ) : (
          t('connect-named', 'Connect {{name}}', { name: GATEWAY_NAMES[kind] })
        )}
      </Button>
    </form>
  );
};

/**
 * Connects a gateway: picked from all of them, or `only` this one (its
 * integration page), which opens on its credentials.
 */
export const AddGateway = ({ only = null }: { only?: PaymentGatewayKind | null }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<PaymentGatewayKind | null>(only);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        // Closing clears the credentials: the form unmounts.
        if (!next) setKind(only);
      }}
    >
      <Dialog.Trigger render={<Button />}>
        <IconPlus />
        {t('add', 'Connect a gateway')}
      </Dialog.Trigger>
      <Dialog.Content className={kind ? undefined : 'sm:max-w-2xl'}>
        <Dialog.HeaderCombined
          title={
            kind
              ? t('connect-named', 'Connect {{name}}', { name: GATEWAY_NAMES[kind] })
              : t('add', 'Connect a gateway')
          }
          description={t(
            'add-description',
            'Credentials are checked with the gateway and stored encrypted.',
          )}
        />
        {open &&
          (kind ? (
            <ConnectForm
              kind={kind}
              onBack={only ? undefined : () => setKind(null)}
              onAdded={() => {
                setOpen(false);
                setKind(only);
              }}
            />
          ) : (
            <ScrollArea className="max-h-128">
              <GatewayPicker onPick={setKind} />
            </ScrollArea>
          ))}
      </Dialog.Content>
    </Dialog>
  );
};
