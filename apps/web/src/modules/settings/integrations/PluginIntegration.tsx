import { Spinner } from 'erxes-ui';
import { Suspense } from 'react';
import { PluginBoundary } from '~/modules/plugins/PluginBoundary';
import { usePluginText } from '~/modules/plugins/pluginText';
import type { Integration } from './catalog';
import { IntegrationLayout, useIntegrationTab } from './IntegrationLayout';

/** A plugin's integration: core's header and tabs, the plugin's content in each tab. */
export const PluginIntegration = ({
  integration,
  plugin,
}: {
  integration: Integration;
  plugin: string;
}) => {
  const text = usePluginText();
  const [tab, setTab] = useIntegrationTab(integration.tabs[0]?.value ?? '');

  return (
    <IntegrationLayout
      integration={integration}
      tab={tab}
      onTab={setTab}
      tabs={integration.tabs.map(({ value, label, component: Content }) => ({
        value,
        label: text(plugin, label),
        content: (
          <PluginBoundary name={plugin} resetKey={value}>
            <Suspense fallback={<Spinner />}>
              <Content />
            </Suspense>
          </PluginBoundary>
        ),
      }))}
    />
  );
};
