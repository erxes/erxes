import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconChevronRight } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import {
  CONNECTION_CONTENT_TYPE,
  Input,
  Label,
  PanelFormLayout,
  Spinner,
  useToast,
} from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreatedPanelRecord } from '~/modules/side-panel/useCreatedPanelRecord';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import type { Integration } from '../integrations/catalog';
import {
  ConnectionFieldInputs,
  connectionKeys,
  type ConnectionValues,
  CredentialsHelp,
  useConnectionsChanged,
} from '../integrations/ConnectionFields';
import { IntegrationMark, useIntegrationText } from '../integrations/IntegrationStatusBadge';
import { isOAuthIntegration, SignInForm } from './SignInForm';
import { useConnectionDraft, useKeyedIntegrations } from './useVault';

const useLeavePanel = () => {
  const { back, canGoBack, close } = useSidePanel();

  return () => (canGoBack ? back() : close());
};

const useConnect = (onConnected: ((connectionId: string) => void) | undefined) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { toast } = useToast();
  const changed = useConnectionsChanged();
  const showCreated = useCreatedPanelRecord(CONNECTION_CONTENT_TYPE);
  const leave = useLeavePanel();

  return useMutation(
    orpc.integrations.connect.mutationOptions({
      onSuccess: (connection) => {
        void changed();
        toast({ title: t('added', '{{name}} is connected', { name: connection.name }) });

        if (!onConnected) return showCreated(connection.id);

        onConnected(connection.id);
        leave();
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
  onConnected,
  onCancel,
}: {
  integration: Integration;
  onConnected: ((connectionId: string) => void) | undefined;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const id = useId();
  const { toast } = useToast();
  const brand = useIntegrationText()(integration).name;
  const [name, setName] = useState(brand);
  const [values, setValues] = useState<ConnectionValues>({});
  const connect = useConnect(onConnected);
  const { keys, ready } = connectionKeys(integration, values);

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();

        if (ready && name.trim()) {
          connect.mutate({ key: integration.key, name: name.trim(), keys });
        } else {
          toast({
            variant: 'destructive',
            title: t('incomplete', 'Fill in every required field'),
          });
        }
      }}
    >
      <PanelFormLayout
        onCancel={onCancel}
        saving={connect.isPending}
        saveLabel={t('connect-named', 'Connect {{name}}', { name: brand })}
      >
        <div className="space-y-3 p-1">
          <div className="flex items-center gap-3">
            <IntegrationMark integration={integration} />
            <span className="font-medium">{brand}</span>
          </div>
          <CredentialsHelp integration={integration} />
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-name`}>{t('name', 'Name')}</Label>
            <Input
              id={`${id}-name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <ConnectionFieldInputs
            integration={integration}
            values={values}
            onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
          />
        </div>
      </PanelFormLayout>
    </form>
  );
};

const ServiceChooser = ({
  integrations,
  onPick,
}: {
  integrations: Integration[];
  onPick: (key: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'vault' });
  const text = useIntegrationText();

  if (!integrations.length) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        {t('nothing-to-connect', 'Your role has no integration to connect.')}
      </p>
    );
  }

  return (
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
      <p className="px-1 text-sm text-muted-foreground">
        {t('choose-service', 'Choose what to connect.')}
      </p>
      <ul className="space-y-2">
        {integrations.map((integration) => {
          const { name, summary } = text(integration);

          return (
            <li key={integration.key}>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary"
                onClick={() => onPick(integration.key)}
              >
                <IntegrationMark integration={integration} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{summary}</span>
                </span>
                <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const ConnectionPanelNew = () => {
  const { integration: wanted, category, onConnected } = useConnectionDraft();
  const { integrations, loading } = useKeyedIntegrations({ integration: wanted, category });
  const [picked, setPicked] = useState<string | null>(null);
  const leave = useLeavePanel();
  const key = wanted ?? picked;
  const integration = integrations.find((item) => item.key === key);

  if (loading) return <Spinner area="lg" />;

  if (!integration) return <ServiceChooser integrations={integrations} onPick={setPicked} />;

  if (isOAuthIntegration(integration))
    return (
      <SignInForm
        key={integration.key}
        integration={integration}
        onCancel={wanted ? leave : () => setPicked(null)}
      />
    );

  return (
    <ConnectForm
      key={integration.key}
      integration={integration}
      onConnected={onConnected}
      onCancel={wanted ? leave : () => setPicked(null)}
    />
  );
};
