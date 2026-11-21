import { messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { parseAsBoolean, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { usePluginText } from '~/modules/plugins/pluginText';
import type { PluginIntegrationEntry } from '../catalog';

export const useIntegrationView = () =>
  useQueryStates({
    pick: parseAsString,
    connect: parseAsBoolean.withDefault(false),
    connected: parseAsInteger,
    failed: parseAsInteger,
  });

const CLOSED = { pick: null, connect: null, connected: null, failed: null };

export const useCloseStep = () => {
  const [, setView] = useIntegrationView();

  return () => void setView(CLOSED);
};

export const useAccountsChanged = () => {
  const client = useQueryClient();

  return () =>
    Promise.all(
      [
        orpc.integrationAccounts.definitions.key(),
        orpc.integrationAccounts.list.key(),
        orpc.integrationAccounts.choices.key(),
        orpc.automations.catalog.key(),
      ].map((queryKey) => client.invalidateQueries({ queryKey })),
    );
};

export const useFailureToast = (title: string) => {
  const { toast } = useToast();

  return (error: Error) => toast({ variant: 'destructive', title, description: messageOf(error) });
};

export const useConnect = (integration: PluginIntegrationEntry) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const [, setView] = useIntegrationView();
  const onError = useFailureToast(t('connect-failed', 'Could not start connecting'));

  const start = useMutation(
    orpc.integrationAccounts.start.mutationOptions({
      onSuccess: ({ url }) => window.location.assign(url),
      onError,
    }),
  );

  return {
    connect: () =>
      integration.definition.connect.type === 'form'
        ? void setView({ ...CLOSED, connect: true })
        : start.mutate({ integration: integration.key }),
    pending: start.isPending,
  };
};

export const useKindText = (integration: PluginIntegrationEntry) => {
  const text = usePluginText();
  const kinds = integration.definition.accounts;

  return {
    several: kinds.length > 1,
    label: (kind: string) =>
      text(integration.plugin, kinds.find((item) => item.kind === kind)?.label ?? kind),
    plural: (kind: string) =>
      text(integration.plugin, kinds.find((item) => item.kind === kind)?.plural ?? kind),
  };
};
