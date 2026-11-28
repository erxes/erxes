import { IconChevronRight } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { PluginBoundary } from '~/modules/plugins/PluginBoundary';
import { usePluginText, usePluginTitle } from '~/modules/plugins/pluginText';
import { type Integration, joinedTab } from './catalog';
import type { IntegrationTab } from './IntegrationLayout';
import { IntegrationStatusBadge, useIntegrationText } from './IntegrationStatusBadge';
import { OverviewSection } from './IntegrationLayout';

type Joined = Integration['joined'][number];

/** The plugin's name over the joined integration's own (`Frontline`, `Frontline · Calls`). */
const useJoinedLabel = () => {
  const title = usePluginTitle();
  const text = usePluginText();

  return (joined: Joined, label: string) => {
    const plugin = title(joined.plugin ?? '');

    return joined.tabs.length > 1 ? `${plugin} · ${text(joined.plugin ?? '', label)}` : plugin;
  };
};

/** The tabs the plugins' joined integrations draw on their host's page, after its own. */
export const useJoinedTabs = (integration: Integration): IntegrationTab[] => {
  const label = useJoinedLabel();

  return integration.joined.flatMap((joined) =>
    joined.tabs.map(({ value, label: own, component: Content }) => ({
      value: joinedTab(joined, value),
      label: label(joined, own),
      content: (
        <PluginBoundary name={joined.plugin ?? ''} resetKey={value}>
          <Suspense fallback={<Spinner />}>
            <Content />
          </Suspense>
        </PluginBoundary>
      ),
    })),
  );
};

/** The overview's "Used by": each plugin that connects through it, its state, and its tab. */
export const JoinedUses = ({ integration }: { integration: Integration }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const title = usePluginTitle();
  const text = useIntegrationText();

  if (!integration.joined.length) return null;

  return (
    <OverviewSection title={t('used-by', 'Used by')}>
      <ul className="divide-y rounded-lg border text-sm">
        {integration.joined.map((joined) => {
          const first = joined.tabs[0]?.value;

          const row = (
            <>
              <joined.icon className="size-5 shrink-0" />
              <span className="min-w-0 flex-1 space-y-0.5">
                <span className="block font-medium">{title(joined.plugin ?? '')}</span>
                <span className="block text-muted-foreground">{text(joined).summary}</span>
              </span>
              <IntegrationStatusBadge status={joined.status} />
              {joined.status.count !== null && (
                <span className="text-muted-foreground tabular-nums">{joined.status.count}</span>
              )}
            </>
          );

          return (
            <li key={joined.slug}>
              {first ? (
                <Link
                  to={paths.settings.integrationTab(integration.slug, joinedTab(joined, first))}
                  className="flex items-center gap-3 p-3 hover:bg-accent"
                >
                  {row}
                  <IconChevronRight className="size-4 text-muted-foreground" />
                </Link>
              ) : (
                <div className="flex items-center gap-3 p-3">{row}</div>
              )}
            </li>
          );
        })}
      </ul>
    </OverviewSection>
  );
};
