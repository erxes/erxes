import type { CustomerAccount } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconLogout, IconLock, IconLockOpen, IconWorldWww } from '@tabler/icons-react';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, PanelSection, useConfirm, useFormat, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCan } from '~/modules/auth/session';
import { pluginTitle, useInstalledPlugins } from '~/modules/products/useCatalogContext';

/** Blocking and signing out, then the list again. */
const useAccountActions = (customerId: string) => {
  const client = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation('contact', { keyPrefix: 'accounts' });

  const refresh = () =>
    client.invalidateQueries({
      queryKey: orpc.customerAccounts.list.key({ input: { customerId } }),
    });

  const onError = (error: unknown) =>
    toast({
      variant: 'destructive',
      title: t('failed', 'Could not change the account'),
      description: messageOf(error),
    });

  return {
    setStatus: useMutation(
      orpc.customerAccounts.setStatus.mutationOptions({ onSuccess: refresh, onError }),
    ),
    signOut: useMutation(
      orpc.customerAccounts.signOut.mutationOptions({ onSuccess: refresh, onError }),
    ),
  };
};

/** One website the customer signed up on: its logins, when they last signed in, and staff's actions. */
const AccountRow = ({ account, plugin }: { account: CustomerAccount; plugin: string }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'accounts' });
  const fmt = useFormat();
  const can = useCan();
  const { confirm } = useConfirm();
  const actions = useAccountActions(account.customerId);
  const blocked = account.status === 'blocked';
  const busy = actions.setStatus.isPending || actions.signOut.isPending;

  const block = () =>
    void confirm({
      message: t(
        'confirm-block',
        'Block {{website}}? They are signed out and can’t sign in there.',
        {
          website: account.websiteName,
        },
      ),
    }).then(() => actions.setStatus.mutate({ id: account.id, status: 'blocked' }));

  return (
    <li className="space-y-1 rounded-md border px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <IconWorldWww className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="truncate font-medium">{account.websiteName}</span>
        <span className="truncate text-xs text-muted-foreground">{plugin}</span>
        {blocked && (
          <Badge variant="destructive" className="ml-auto shrink-0">
            {t('blocked', 'Blocked')}
          </Badge>
        )}
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
      {can('contacts.edit') && (
        <div className="flex flex-wrap gap-1 pt-1">
          {account.sessions > 0 && !blocked && (
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => actions.signOut.mutate({ id: account.id })}
            >
              <IconLogout />
              {t('sign-out', 'Sign out')}
            </Button>
          )}
          {blocked ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => actions.setStatus.mutate({ id: account.id, status: 'active' })}
            >
              <IconLockOpen />
              {t('unblock', 'Let sign in')}
            </Button>
          ) : (
            <Button size="sm" variant="ghost" disabled={busy} onClick={block}>
              <IconLock />
              {t('block', 'Block')}
            </Button>
          )}
        </div>
      )}
    </li>
  );
};

/** The websites the customer signed up on, one account each; nothing when there are none. */
export const CustomerAccountsSection = ({ customerId }: { customerId: string }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'accounts' });
  const { plugins } = useInstalledPlugins();
  const can = useCan();

  const accounts = useQuery(
    orpc.customerAccounts.list.queryOptions({
      input: can('contacts.view') ? { customerId } : skipToken,
    }),
  );

  const rows = accounts.data?.data ?? [];

  if (!rows.length) return null;

  return (
    <PanelSection title={t('title', 'Website accounts')} nested>
      <ul className="space-y-2 pb-2">
        {rows.map((account) => (
          <AccountRow
            key={account.id}
            account={account}
            plugin={pluginTitle(plugins, account.plugin)}
          />
        ))}
      </ul>
    </PanelSection>
  );
};
