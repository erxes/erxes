import { IconMail, IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Collapsible, Spinner, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMailSendingAccounts } from '../hooks/useMailSendingAccounts';
import {
  MailSendingAccountForm,
  MailSendingAccountStatus,
} from './MailSendingAccountForm';

export const MailSendingAccountsCollapse = () => {
  const { t } = useTranslation('frontline');

  return (
    <Collapsible className="w-full rounded-lg bg-muted">
      <Collapsible.Trigger asChild>
        <Button
          variant="secondary"
          className="group flex h-auto w-full justify-start gap-3 bg-transparent px-3 font-semibold hover:bg-transparent"
        >
          <Collapsible.TriggerIcon className="text-accent-foreground" />
          <IconMail size={18} />
          {t('mail-sending-accounts')}
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="rounded-lg bg-background p-3 shadow-xs">
        <MailSendingAccounts />
      </Collapsible.Content>
    </Collapsible>
  );
};

export const MailSendingAccounts = () => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const {
    accounts,
    loading,
    verifyAccount,
    verifying,
    removeAccount,
    removing,
  } = useMailSendingAccounts();
  const [adding, setAdding] = useState(false);

  const remove = (_id: string) =>
    confirm({ message: t('confirm-remove-sending-account') }).then(() =>
      removeAccount({ variables: { _id } }),
    );

  if (loading && !accounts.length) {
    return <Spinner className="p-10" />;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t('mail-sending-accounts-description')}
      </p>

      {accounts.length === 0 && !adding && (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          {t('mail-sending-accounts-empty')}
        </p>
      )}

      {accounts.map((account) => (
        <div key={account._id} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{account.name}</span>
            <span className="text-xs text-muted-foreground">
              {account.provider}
            </span>
            <Button
              size="icon"
              variant="ghost"
              type="button"
              className="ml-auto text-destructive"
              disabled={removing}
              onClick={() => remove(account._id)}
            >
              <IconTrash size={16} />
            </Button>
          </div>
          <MailSendingAccountStatus
            account={account}
            verifying={verifying}
            onVerify={() => verifyAccount({ variables: { _id: account._id } })}
          />
        </div>
      ))}

      {adding ? (
        <MailSendingAccountForm
          onCancel={() => setAdding(false)}
          onCreated={() => setAdding(false)}
        />
      ) : (
        <Button
          variant="secondary"
          type="button"
          className="w-full"
          onClick={() => setAdding(true)}
        >
          <IconPlus size={16} />
          {t('mail-sending-account-add')}
        </Button>
      )}
    </div>
  );
};
