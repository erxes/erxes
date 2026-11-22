import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useCan } from '~/modules/auth/session';
import type { CoreIntegration } from '../catalog';
import { ConnectionsIntegration } from '../ConnectionsIntegration';
import { BankAccounts } from './BankAccounts';
import { BankTransfers } from './BankTransfers';

/**
 * Settings › Integrations › a bank's corporate gateway: its connections (the
 * keys the bank gave), then the accounts they read and the money sent from
 * them, for members who may see bank accounts.
 */
export const BanksIntegration = ({ integration }: { integration: CoreIntegration }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.banks' });
  const can = useCan();
  const mayView = can('banks.view');
  const connections = useQuery({ ...orpc.banks.connections.queryOptions(), enabled: mayView });

  const own = (connections.data?.data ?? []).filter(
    (connection) => connection.key === integration.key && connection.status === 'active',
  );

  const view = (content: ReactNode) =>
    connections.isSuccess && own.length === 0 ? (
      <p className="rounded-lg border p-4 text-sm">
        {t('connect-first', 'Connect it first: its accounts show here once it is.')}
      </p>
    ) : (
      <QueryState query={connections}>{() => content}</QueryState>
    );

  return (
    <ConnectionsIntegration
      integration={integration}
      tabs={
        mayView
          ? [
              {
                value: 'accounts',
                label: t('tab-accounts', 'Accounts'),
                content: view(<BankAccounts connections={own} />),
              },
              {
                value: 'transfers',
                label: t('tab-transfers', 'Transfers'),
                content: view(<BankTransfers connections={own} />),
              },
            ]
          : []
      }
    />
  );
};
