import { IconExternalLink, IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { useMailSendingAccounts } from '../hooks/useMailSendingAccounts';
import {
  MailSendingAccountForm,
  MailSendingAccountStatus,
} from './MailSendingAccountForm';

export const MailSendingRequired = () => {
  const { t } = useTranslation('frontline');
  const { accounts, verifyAccount, verifying } = useMailSendingAccounts();
  const [adding, setAdding] = useState(false);

  const pending = accounts.filter((account) => account.status !== 'verified');

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t('mail-sending-required-description')}
      </p>

      <div className="space-y-2 rounded-lg border p-3">
        <p className="text-sm font-medium">
          {t('mail-sending-required-cloudflare')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('mail-sending-required-cloudflare-description')}
        </p>
        <Button variant="secondary" asChild className="w-full">
          <Link
            to={`/settings/${FrontlinePaths.Frontline}${FrontlinePaths.IntegrationConfig}`}
          >
            <IconExternalLink size={16} />
            {t('mail-sending-required-cloudflare-action')}
          </Link>
        </Button>
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <p className="text-sm font-medium">
          {t('mail-sending-required-provider')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('mail-sending-required-provider-description')}
        </p>

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

      {pending.map((account) => (
        <MailSendingAccountStatus
          key={account._id}
          account={account}
          verifying={verifying}
          onVerify={() => verifyAccount({ variables: { _id: account._id } })}
        />
      ))}
    </div>
  );
};
