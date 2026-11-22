import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { ConnectionList } from '../vault/ConnectionList';
import { connectionsOf, useConnections } from '../vault/useVault';
import type { Integration } from './catalog';
import { OverviewSection } from './IntegrationLayout';

export const IntegrationConnections = ({ integration }: { integration: Integration }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const connections = useConnections();

  return (
    <OverviewSection title={t('connections', 'Connections')}>
      <QueryState
        query={connections}
        isEmpty={({ data }) => !connectionsOf(data, [integration]).length}
        empty={
          <p className="rounded-lg border p-4 text-sm">{t('none', 'Nothing connected yet.')}</p>
        }
      >
        {({ data }) => (
          <ConnectionList rows={connectionsOf(data, [integration])} showService={false} />
        )}
      </QueryState>
    </OverviewSection>
  );
};
