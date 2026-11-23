import type { CustomerAccount } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconWorldWww } from '@tabler/icons-react';
import { skipToken, useQuery } from '@tanstack/react-query';
import { PanelSection, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCan } from '~/modules/auth/session';

/** One portal the customer signed up on: its logins, and when they last signed in. */
const AccountRow = ({ account }: { account: CustomerAccount }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'accounts' });
  const fmt = useFormat();

  return (
    <li className="space-y-1 rounded-md border px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <IconWorldWww className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="truncate font-medium">{account.portalName}</span>
      </div>
      <p className="truncate text-muted-foreground">{account.logins.join(', ')}</p>
      <p className="text-xs text-muted-foreground">
        {account.lastSignedInAt
          ? t('last-signed-in', 'Last signed in {{when}}', {
              when: fmt.dateTime(account.lastSignedInAt),
            })
          : t('never-signed-in', 'Never signed in')}
        {' · '}
        {t('sessions', '{{count}} signed in now', { count: account.sessions })}
      </p>
    </li>
  );
};

/** The portals the customer signed up on, one account each; nothing when there are none. */
export const CustomerAccountsSection = ({ customerId }: { customerId: string }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'accounts' });
  const can = useCan();

  const accounts = useQuery(
    orpc.customerAccounts.list.queryOptions({
      input: can('contacts.view') ? { customerId } : skipToken,
    }),
  );

  const rows = accounts.data?.data ?? [];

  if (!rows.length) return null;

  return (
    <PanelSection title={t('title', 'Accounts')} nested>
      <ul className="space-y-2 pb-2">
        {rows.map((account) => (
          <AccountRow key={account.id} account={account} />
        ))}
      </ul>
    </PanelSection>
  );
};
