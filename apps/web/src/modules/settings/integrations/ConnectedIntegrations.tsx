import type { VaultHolding } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconChevronRight, IconLock, IconPlugConnected } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Empty } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { NoMatches } from '~/components/NoMatches';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { ConnectionList } from '../vault/ConnectionList';
import { connectionsOf, useConnections } from '../vault/useVault';
import { type Integration, useIntegrations } from './catalog';
import { IntegrationStatusBadge, useIntegrationText } from './IntegrationStatusBadge';

const HOLDER_PAGES: Record<VaultHolding['holder'], string> = {
  email: paths.settings.email,
  'file-bucket': paths.settings.fileUpload,
  webhook: paths.settings.webhooks,
  'audit-stream': paths.settings.auditLog,
  'two-step': paths.settings.teamMembers,
  plugin: paths.settings.plugins,
};

const ROW =
  'flex items-center gap-3 p-3 text-sm transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary';

export const useConnected = (search: string) => {
  const { integrations, listed } = useIntegrations();
  const connections = useConnections();
  const text = useIntegrationText();
  const needle = search.trim().toLocaleLowerCase();

  const matches = (...words: string[]) =>
    words.some((word) => word.toLocaleLowerCase().includes(needle));

  const rows = connectionsOf(
    connections.data?.data ?? [],
    integrations.filter(({ keyed }) => keyed),
  );

  const withRows = new Set(rows.map(({ integration }) => integration.slug));

  const setUp = integrations.filter(
    ({ slug, status }) => status.state !== 'not-set-up' && !withRows.has(slug),
  );

  return {
    connections,
    pending: listed.isPending || connections.isPending,
    count: rows.length + setUp.length,
    rows: rows.filter(({ connection, integration }) =>
      matches(connection.name, text(integration).name),
    ),
    setUp: setUp.filter((integration) => matches(text(integration).name)),
  };
};

const SetUpRow = ({ integration }: { integration: Integration }) => {
  const { name } = useIntegrationText()(integration);

  return (
    <li>
      <Link to={paths.settings.integration(integration.slug)} className={ROW}>
        <integration.icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 font-medium">{name}</span>
        <IntegrationStatusBadge status={integration.status} />
        <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-2">
    <h2 className="text-sm font-medium">{title}</h2>
    {children}
  </section>
);

const Holdings = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'vault' });
  const holdings = useQuery(orpc.secrets.holdings.queryOptions());

  const labels: Record<VaultHolding['holder'], string> = {
    email: t('holder.email', 'Organization email password'),
    'file-bucket': t('holder.file-bucket', 'File storage key'),
    webhook: t('holder.webhook', 'Webhook signing keys'),
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
                <Link to={HOLDER_PAGES[holder]} className={ROW}>
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

const NothingConnected = ({ onBrowse }: { onBrowse: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });

  return (
    <Empty variant="outline" size="sm">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconPlugConnected />
        </Empty.Media>
        <Empty.Title>{t('nothing-connected', 'Nothing is connected yet.')}</Empty.Title>
      </Empty.Header>
      <Empty.Content>
        <Button onClick={onBrowse}>{t('browse-all', 'Browse integrations')}</Button>
      </Empty.Content>
    </Empty>
  );
};

export const ConnectedIntegrations = ({
  connected,
  onBrowse,
}: {
  connected: ReturnType<typeof useConnected>;
  onBrowse: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const can = useCan();
  const { rows, setUp, count } = connected;

  return (
    <div className="space-y-6">
      <QueryState query={connected.connections}>
        {() =>
          !count ? (
            <NothingConnected onBrowse={onBrowse} />
          ) : rows.length + setUp.length ? (
            <ConnectionList rows={rows} showService>
              {setUp.map((integration) => (
                <SetUpRow key={integration.slug} integration={integration} />
              ))}
            </ConnectionList>
          ) : (
            <NoMatches
              title={t('no-match', 'No integrations match')}
              description={t('try-another-word', 'Try another word.')}
            />
          )
        }
      </QueryState>
      {can('integrations.manage') && <Holdings />}
    </div>
  );
};
