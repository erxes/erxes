import { IconPlugConnected } from '@tabler/icons-react';
import { PageContainer, PageHeader, ScrollArea, Tabs, AppBreadcrumb } from 'erxes-ui';
import { parseAsString, useQueryState } from 'nuqs';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { paths } from '~/lib/paths';
import { countryNames } from '~/lib/region';
import { usePluginText } from '~/modules/plugins/pluginText';
import type { Integration } from './catalog';
import {
  IntegrationMark,
  IntegrationStatusBadge,
  useIntegrationText,
} from './IntegrationStatusBadge';

export interface IntegrationTab {
  value: string;
  label: string;
  content: ReactNode;
}

/** The tab in the address (`?tab=`), so a link or reload opens the same one. */
export const useIntegrationTab = (first: string) => {
  const [tab, setTab] = useQueryState('tab', parseAsString.withDefault(first));

  return [tab, (next: string) => void setTab(next)] as const;
};

/** Its mark, name, state, summary and where it works, with its main action. */
const IntegrationHeader = ({
  integration,
  actions,
}: {
  integration: Integration;
  actions?: ReactNode;
}) => {
  const { t, i18n } = useTranslation('settings', { keyPrefix: 'integrations' });
  const { name, summary } = useIntegrationText()(integration);

  return (
    <header className="flex flex-wrap items-start gap-4">
      <IntegrationMark integration={integration} size="lg" />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="min-w-0 break-words text-xl font-semibold">{name}</h1>
          <IntegrationStatusBadge status={integration.status} />
        </div>
        <p className="text-sm text-muted-foreground">{summary}</p>
        <p className="text-xs text-muted-foreground">
          {integration.countries.length
            ? t('made-for', 'Made for {{countries}}', {
                countries: countryNames([...integration.countries], i18n.language),
              })
            : t('anywhere', 'Works in any country')}
        </p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
};

/** A heading and its content, as the Overview tab lists them. */
export const OverviewSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-2">
    <h2 className="text-sm font-medium">{title}</h2>
    {children}
  </section>
);

/** The actions it brings to automations, under its first tab. */
const InAutomations = ({ integration }: { integration: Integration }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const pluginText = usePluginText();
  const { plugin } = integration;
  const words = (text: string) => (plugin ? pluginText(plugin, text) : text);

  if (!integration.actions.length) return null;

  return (
    <OverviewSection title={t('in-automations', 'In automations')}>
      <ul className="divide-y rounded-lg border text-sm">
        {integration.actions.map((action) => (
          <li key={action.type} className="space-y-0.5 p-3">
            <p className="font-medium">{words(action.label)}</p>
            {action.description && (
              <p className="text-muted-foreground">{words(action.description)}</p>
            )}
          </li>
        ))}
      </ul>
    </OverviewSection>
  );
};

/**
 * One integration's page: its mark, name, state and main action on top,
 * then its tabs (Overview first).
 */
export const IntegrationLayout = ({
  integration,
  actions,
  tabs,
  tab,
  onTab,
}: {
  integration: Integration;
  actions?: ReactNode;
  tabs: IntegrationTab[];
  tab: string;
  onTab: (tab: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const { name } = useIntegrationText()(integration);
  const current = tabs.find((item) => item.value === tab) ?? tabs[0];

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Integrations'),
                to: paths.settings.integrations,
                icon: IconPlugConnected,
              },
              { label: name, to: paths.settings.integration(integration.slug) },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1" fitWidth>
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          <IntegrationHeader integration={integration} actions={actions} />
          {tabs.length > 1 && (
            <Tabs value={current?.value} onValueChange={onTab}>
              <Tabs.List variant="flush" className="h-9">
                {tabs.map((item) => (
                  <Tabs.Trigger key={item.value} value={item.value}>
                    {item.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </Tabs>
          )}
          {current?.content}
          {current === tabs[0] && <InAutomations integration={integration} />}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};

/** The overview's "How it works", its lines already translated. */
export const HowItWorks = ({ title, lines }: { title: string; lines: string[] }) => (
  <OverviewSection title={title}>
    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  </OverviewSection>
);
