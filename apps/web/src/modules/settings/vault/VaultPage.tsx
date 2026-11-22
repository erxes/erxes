import type { VaultHolding } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconChevronRight, IconLock, IconPlus, IconShieldLock } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  CONNECTION_CONTENT_TYPE,
  PageContainer,
  PageHeader,
  ScrollArea,
  useOpenRecord,
} from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { useMayOpenIntegrations } from '../integrations/catalog';
import { ConnectionList } from './ConnectionList';
import { connectionsOf, useConnections, useKeyedIntegrations } from './useVault';

const HOLDER_PAGES: Record<VaultHolding['holder'], string> = {
  email: paths.settings.email,
  'file-bucket': paths.settings.fileUpload,
  webhook: paths.settings.webhooks,
  assistant: paths.settings.assistant,
  'audit-stream': paths.settings.auditLog,
  'two-step': paths.settings.teamMembers,
  plugin: paths.settings.plugins,
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-2">
    <h2 className="text-sm font-medium">{title}</h2>
    {children}
  </section>
);

const Connections = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'vault' });
  const connections = useConnections();
  const { integrations } = useKeyedIntegrations();

  return (
    <Section title={t('connections', 'Connections')}>
      <QueryState
        query={connections}
        isEmpty={({ data }) => !data.length}
        empty={
          <p className="rounded-lg border p-4 text-sm text-muted-foreground">
            {t('no-connections', 'Nothing connected yet. Add opens the list of services.')}
          </p>
        }
      >
        {({ data }) => <ConnectionList rows={connectionsOf(data, integrations)} showService />}
      </QueryState>
    </Section>
  );
};

const Holdings = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'vault' });
  const holdings = useQuery(orpc.secrets.holdings.queryOptions());

  const labels: Record<VaultHolding['holder'], string> = {
    email: t('holder.email', 'Email sending password'),
    'file-bucket': t('holder.file-bucket', 'File storage key'),
    webhook: t('holder.webhook', 'Webhook signing keys'),
    assistant: t('holder.assistant', 'AI provider keys'),
    'audit-stream': t('holder.audit-stream', 'Audit log stream keys'),
    'two-step': t('holder.two-step', 'Two-step sign-in codes'),
    plugin: t('holder.plugin', 'Plugin secrets'),
  };

  return (
    <QueryState query={holdings} isEmpty={({ data }) => !data.length}>
      {({ data }) => (
        <Section title={t('kept-by-features', 'Kept by features')}>
          <ul className="divide-y rounded-lg border">
            {data.map(({ holder, plugin, count }) => (
              <li key={`${holder}:${plugin ?? ''}`}>
                <Link
                  to={HOLDER_PAGES[holder]}
                  className="flex items-center gap-3 p-3 text-sm transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <IconLock className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 font-medium">
                    {plugin ? `${labels[holder]}: ${plugin}` : labels[holder]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t('held', '{{count}} kept', { count })}
                  </span>
                  <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </QueryState>
  );
};

export const VaultPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'vault' });
  const can = useCan();
  const { openNew } = useOpenRecord();

  if (!useMayOpenIntegrations()) return <Navigate to={paths.settings.root} replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: t('title', 'Vault'), to: paths.settings.vault, icon: IconShieldLock }]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          <Button onClick={() => openNew(CONNECTION_CONTENT_TYPE)}>
            <IconPlus />
            {t('add', 'Add')}
          </Button>
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          <p className="text-sm text-muted-foreground">
            {t(
              'intro',
              'Every password, token and key this organisation keeps. Each is stored encrypted and is never shown again. Pages and plugins pick a connection from here.',
            )}
          </p>
          <Connections />
          {can('integrations.manage') && <Holdings />}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
