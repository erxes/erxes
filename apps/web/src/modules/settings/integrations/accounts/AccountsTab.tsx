import { orpc } from '@erxes/core-contract/client';
import { IconPlugConnected } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Empty, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { usePluginText } from '~/modules/plugins/pluginText';
import type { PluginIntegrationEntry } from '../catalog';
import { AccountRow } from './AccountRow';
import { useConnect, useIntegrationView, useKindText } from './accountState';

export const ConnectButton = ({
  integration,
  label,
  variant,
  size,
}: {
  integration: PluginIntegrationEntry;
  label: string;
  variant?: 'outline';
  size?: 'sm';
}) => {
  const { connect, pending } = useConnect(integration);

  return (
    <Button variant={variant} size={size} disabled={pending} onClick={connect}>
      {pending ? <Spinner size="sm" /> : label}
    </Button>
  );
};

const ConnectNotice = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const [{ connected, failed }, setView] = useIntegrationView();

  if (connected === null && failed === null) return null;

  const message = [
    connected ? t('connected-count', '{{count}} connected', { count: connected }) : null,
    failed
      ? t('failed-count', '{{count}} could not be connected. Connect again to retry.', {
          count: failed,
        })
      : null,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <output className="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm">
      <p className="min-w-0 flex-1">
        {message ||
          t(
            'nothing-found',
            'The sign-in found nothing to connect. Check that it manages what you want to connect.',
          )}
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void setView({ connected: null, failed: null })}
      >
        {t('dismiss', 'Dismiss')}
      </Button>
    </output>
  );
};

export const AccountsTab = ({ integration }: { integration: PluginIntegrationEntry }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const text = usePluginText();
  const kindText = useKindText(integration);
  const name = text(integration.plugin, integration.name);

  const accounts = useQuery(
    orpc.integrationAccounts.list.queryOptions({ input: { integration: integration.key } }),
  );

  return (
    <div className="space-y-4">
      <ConnectNotice />
      <QueryState
        query={accounts}
        isEmpty={({ data }) => !data.length}
        empty={
          <Empty variant="outline">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconPlugConnected />
              </Empty.Media>
              <Empty.Title>{t('empty', 'Nothing connected yet')}</Empty.Title>
              <Empty.Description>
                {t('empty-description', 'Use Connect to add {{name}} to erxes.', { name })}
              </Empty.Description>
            </Empty.Header>
          </Empty>
        }
      >
        {({ data }) => (
          <ul className="divide-y rounded-lg border">
            {data.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                kindLabel={kindText.several ? kindText.label(account.kind) : undefined}
                checks={integration.definition.checks}
                reconnect={
                  <ConnectButton
                    integration={integration}
                    label={t('reconnect', 'Reconnect')}
                    variant="outline"
                    size="sm"
                  />
                }
              />
            ))}
          </ul>
        )}
      </QueryState>
    </div>
  );
};
