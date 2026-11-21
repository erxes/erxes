import { Spinner } from 'erxes-ui';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { PluginBoundary } from '~/modules/plugins/PluginBoundary';
import { usePluginText } from '~/modules/plugins/pluginText';
import { AccountsTab, ConnectButton } from './accounts/AccountsTab';
import { useIntegrationView } from './accounts/accountState';
import { ConnectForm } from './accounts/ConnectForm';
import { PickStep } from './accounts/PickStep';
import { SetupTab } from './accounts/SetupTab';
import type { PluginIntegrationEntry } from './catalog';
import { IntegrationLayout, useIntegrationTab } from './IntegrationLayout';

const ACCOUNTS_TAB = 'accounts';

const SETUP_TAB = 'setup';

const RESERVED_TABS = new Set([ACCOUNTS_TAB, SETUP_TAB]);

const IntegrationTabs = ({ integration }: { integration: PluginIntegrationEntry }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const text = usePluginText();
  const [tab, setTab] = useIntegrationTab(ACCOUNTS_TAB);
  const { setup } = integration.definition;

  return (
    <IntegrationLayout
      integration={integration}
      tab={tab}
      onTab={setTab}
      actions={<ConnectButton integration={integration} label={t('connect', 'Connect')} />}
      tabs={[
        {
          value: ACCOUNTS_TAB,
          label: t('tab-accounts', 'Accounts'),
          content: <AccountsTab integration={integration} />,
        },
        ...(setup
          ? [
              {
                value: SETUP_TAB,
                label: t('tab-setup', 'Setup'),
                content: <SetupTab integration={integration} fields={setup.fields} />,
              },
            ]
          : []),
        ...integration.tabs
          .filter(({ value }) => !RESERVED_TABS.has(value))
          .map(({ value, label, component: Content }) => ({
            value,
            label: text(integration.plugin, label),
            content: (
              <PluginBoundary name={integration.plugin} resetKey={value}>
                <Suspense fallback={<Spinner />}>
                  <Content />
                </Suspense>
              </PluginBoundary>
            ),
          })),
      ]}
    />
  );
};

export const PluginIntegration = ({ integration }: { integration: PluginIntegrationEntry }) => {
  const [{ pick, connect }] = useIntegrationView();
  const { connect: how } = integration.definition;

  if (pick) return <PickStep integration={integration} pickId={pick} />;

  if (connect && how.type === 'form') {
    return <ConnectForm integration={integration} fields={how.fields} />;
  }

  return <IntegrationTabs integration={integration} />;
};
