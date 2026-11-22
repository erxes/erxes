import { Spinner } from 'erxes-ui';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { PluginBoundary } from '~/modules/plugins/PluginBoundary';
import { usePluginText } from '~/modules/plugins/pluginText';
import type { Integration } from './catalog';
import { IntegrationConnections } from './IntegrationConnections';
import { IntegrationLayout, useIntegrationTab } from './IntegrationLayout';

/** A plugin's integration: core's header and tabs, the plugin's content in each tab. */
export const PluginIntegration = ({
  integration,
  plugin,
}: {
  integration: Integration;
  plugin: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const text = usePluginText();
  const [tab, setTab] = useIntegrationTab(integration.tabs[0]?.value ?? 'overview');

  const tabs = integration.tabs.map(({ value, label, component: Content }, index) => ({
    value,
    label: text(plugin, label),
    content: (
      <div className="space-y-6">
        <PluginBoundary name={plugin} resetKey={value}>
          <Suspense fallback={<Spinner />}>
            <Content />
          </Suspense>
        </PluginBoundary>
        {index === 0 && <IntegrationConnections integration={integration} />}
      </div>
    ),
  }));

  return (
    <IntegrationLayout
      integration={integration}
      tab={tab}
      onTab={setTab}
      tabs={
        tabs.length
          ? tabs
          : [
              {
                value: 'overview',
                label: t('tab.overview', 'Overview'),
                content: <IntegrationConnections integration={integration} />,
              },
            ]
      }
    />
  );
};
