import type { Integration as CustomRecord, IntegrationAccount } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconUsersGroup } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Empty, Input, Label, Spinner } from 'erxes-ui';
import { type SubmitEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { AccountRow } from './accounts/AccountRow';
import { useAccountsChanged, useFailureToast } from './accounts/accountState';
import { customIntegrationKey } from './catalog';
import { FormSection } from './FormSection';
import { SealedKeys } from './SealedKeys';

const AccountKeys = ({ account }: { account: IntegrationAccount }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const changed = useAccountsChanged();
  const onError = useFailureToast(t('key-failed', 'Could not save the key'));

  const set = useMutation(
    orpc.integrationAccounts.setSecrets.mutationOptions({ onSuccess: changed, onError }),
  );

  return (
    <div className="space-y-6 pt-3">
      <SealedKeys
        sealedNames={account.sealedNames}
        pending={set.isPending}
        emptyDescription={t(
          'account-keys-empty',
          'Add this account’s keys. A key it lacks comes from the integration’s own.',
        )}
        onSet={(secrets, onDone) => set.mutate({ id: account.id, secrets }, { onSuccess: onDone })}
      />
    </div>
  );
};

const AddAccount = ({
  integration,
  onAdded,
}: {
  integration: string;
  onAdded: (account: IntegrationAccount) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const id = useId();
  const changed = useAccountsChanged();
  const onError = useFailureToast(t('account-add-failed', 'Could not add the account'));
  const [name, setName] = useState('');

  const create = useMutation(
    orpc.integrationAccounts.create.mutationOptions({
      onSuccess: (account) => {
        setName('');
        onAdded(account);

        return changed();
      },
      onError,
    }),
  );

  const trimmed = name.trim();

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event: SubmitEvent) => {
        event.preventDefault();

        if (trimmed) create.mutate({ integration, name: trimmed, secrets: {} });
      }}
    >
      <div className="min-w-48 flex-1 space-y-1.5">
        <Label htmlFor={id}>{t('account-name', 'Name')}</Label>
        <Input
          id={id}
          value={name}
          placeholder={t('account-name-placeholder', 'Second shop')}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={!trimmed || create.isPending}>
        {create.isPending ? <Spinner size="sm" /> : t('account-add', 'Add account')}
      </Button>
    </form>
  );
};

export const CustomAccounts = ({ record }: { record: CustomRecord }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const integration = customIntegrationKey(record.key);
  const [open, setOpen] = useState<string | null>(null);

  const accounts = useQuery(orpc.integrationAccounts.list.queryOptions({ input: { integration } }));

  return (
    <div className="space-y-6">
      <p className="rounded-lg border p-4 text-sm">
        {t(
          'accounts-intro',
          'An account is another set of keys for the same service, like a second shop. An automation step picks one; without one it uses the integration’s own keys.',
        )}
      </p>
      <QueryState
        query={accounts}
        isEmpty={({ data }) => !data.length}
        empty={
          <Empty variant="outline">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconUsersGroup />
              </Empty.Media>
              <Empty.Title>{t('accounts-empty', 'No accounts')}</Empty.Title>
              <Empty.Description>
                {t(
                  'accounts-empty-description',
                  'Programs use the integration’s own keys. Add an account only for a second set.',
                )}
              </Empty.Description>
            </Empty.Header>
          </Empty>
        }
      >
        {({ data }) => (
          <ul className="divide-y rounded-lg border">
            {data.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                checks={false}
                showStatus={false}
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-expanded={open === account.id}
                    onClick={() => setOpen(open === account.id ? null : account.id)}
                  >
                    {t('account-keys', 'Keys ({{count}})', { count: account.sealedNames.length })}
                  </Button>
                }
              >
                {open === account.id && <AccountKeys account={account} />}
              </AccountRow>
            ))}
          </ul>
        )}
      </QueryState>
      <FormSection
        title={t('account-add-title', 'Add an account')}
        description={t('account-add-description', 'Name it, then add its keys.')}
      >
        <AddAccount integration={integration} onAdded={(account) => setOpen(account.id)} />
      </FormSection>
    </div>
  );
};
