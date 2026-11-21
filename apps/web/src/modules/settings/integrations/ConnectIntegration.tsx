import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconPlus } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button, Dialog, Input, Label, Spinner, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CoreIntegration } from './catalog';
import {
  ConnectionFieldInputs,
  connectionKeys,
  type ConnectionValues,
  CredentialsHelp,
  useConnectionsChanged,
} from './ConnectionFields';
import { useIntegrationText } from './IntegrationStatusBadge';

const useConnect = (onAdded: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { toast } = useToast();
  const changed = useConnectionsChanged();

  return useMutation(
    orpc.integrations.connect.mutationOptions({
      onSuccess: (connection) => {
        void changed();
        toast({ title: t('added', '{{name}} is connected', { name: connection.name }) });
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

const ConnectForm = ({
  integration,
  onAdded,
}: {
  integration: CoreIntegration;
  onAdded: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const id = useId();
  const brand = useIntegrationText()(integration).name;
  const [name, setName] = useState(brand);
  const [values, setValues] = useState<ConnectionValues>({});
  const connect = useConnect(onAdded);
  const { keys, ready } = connectionKeys(integration, values);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();

        if (ready) connect.mutate({ key: integration.key, name: name.trim(), keys });
      }}
    >
      <CredentialsHelp integration={integration} />
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-name`}>{t('name', 'Name')}</Label>
        <Input id={`${id}-name`} value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <ConnectionFieldInputs
        integration={integration}
        values={values}
        onChange={(key, value) => setValues({ ...values, [key]: value })}
      />
      <Button
        type="submit"
        className="w-full"
        disabled={connect.isPending || !name.trim() || !ready}
      >
        {connect.isPending ? (
          <Spinner size="sm" />
        ) : (
          t('connect-named', 'Connect {{name}}', { name: brand })
        )}
      </Button>
    </form>
  );
};

export const ConnectIntegration = ({ integration }: { integration: CoreIntegration }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { name } = useIntegrationText()(integration);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<Button />}>
        <IconPlus />
        {t('connect', 'Connect')}
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('connect-named', 'Connect {{name}}', { name })}
          description={t(
            'add-description',
            'Credentials are checked with the service and stored encrypted.',
          )}
        />
        {open && <ConnectForm integration={integration} onAdded={() => setOpen(false)} />}
      </Dialog.Content>
    </Dialog>
  );
};
