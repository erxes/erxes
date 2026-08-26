import { IconPlus } from '@tabler/icons-react';
import { Alert, Button, Input, Label, Select, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IMailSendingAccount,
  useMailSendingAccountActions,
  useMailSendingReadiness,
} from '../hooks/useMailSendingAccounts';
import {
  MailSendingAccountForm,
  MailSendingAccountStatus,
  MailSendingStatusBadge,
} from './MailSendingAccountForm';

export interface IMailSendingValue {
  sendingAccountId: string;
  sendingAddress: string;
}

export const DEFAULT_SENDER = 'default';

const localPart = (address: string) => address.split('@')[0] ?? '';

export const MailSendingChoice = ({
  value,
  onChange,
  suggestedLocalPart,
}: {
  value: IMailSendingValue;
  onChange: (next: IMailSendingValue) => void;
  suggestedLocalPart?: string;
}) => {
  const { t } = useTranslation('frontline');
  const { readiness, loading } = useMailSendingReadiness();
  const { verifyAccount, verifying } = useMailSendingAccountActions();
  const [adding, setAdding] = useState(false);

  const accounts = readiness?.accounts ?? [];
  const cloudflare = readiness?.cloudflare;
  const platform = readiness?.platform;

  const selected = accounts.find(
    (account) => account._id === value.sendingAccountId,
  );

  const picked = value.sendingAccountId || DEFAULT_SENDER;

  // The server tries the connected Cloudflare zone first and falls back to the
  // deployment account, so the one default entry has to name whichever will
  // actually carry the reply — and name nothing at all when neither can.
  const fallbackReady = Boolean(cloudflare?.ready || platform?.ready);

  const fallbackDomain = cloudflare?.ready
    ? cloudflare.domain
    : platform?.ready
      ? platform.domain
      : null;

  const pickAccount = (account: IMailSendingAccount) =>
    onChange({
      sendingAccountId: account._id,
      sendingAddress: `${
        localPart(value.sendingAddress) || suggestedLocalPart || 'support'
      }@${account.domain}`,
    });

  if (loading && !readiness) {
    return <Spinner className="p-10" />;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          {t('mail-sending-sender')}
        </Label>
        <Select
          value={picked}
          onValueChange={(next) => {
            if (next === DEFAULT_SENDER) {
              onChange({ sendingAccountId: '', sendingAddress: '' });
              return;
            }

            const account = accounts.find(
              (candidate) => candidate._id === next,
            );

            if (account) {
              pickAccount(account);
            }
          }}
        >
          <Select.Trigger className="w-full">
            <Select.Value placeholder={t('mail-sending-sender-pick')} />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={DEFAULT_SENDER} disabled={!fallbackReady}>
              {fallbackDomain
                ? t('mail-sending-sender-default', { domain: fallbackDomain })
                : t('mail-sending-sender-default-unavailable')}
            </Select.Item>
            {accounts.map((account) => (
              <Select.Item
                key={account._id}
                value={account._id}
                disabled={account.status !== 'verified'}
              >
                <span className="flex items-center gap-2">
                  {account.name} · {account.domain}
                  <MailSendingStatusBadge status={account.status} />
                </span>
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {picked === DEFAULT_SENDER && !fallbackReady && (
        <Alert variant="destructive">
          <Alert.Description className="text-xs">
            {cloudflare?.reason || t('mail-sending-cloudflare-unavailable')}
          </Alert.Description>
        </Alert>
      )}

      {picked === DEFAULT_SENDER && fallbackReady && (
        <p className="text-xs text-muted-foreground">
          {t('mail-sending-sender-default-description')}
        </p>
      )}

      {selected && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            {t('mail-sending-from-address')}
          </Label>
          <div className="flex items-center gap-1">
            <Input
              value={localPart(value.sendingAddress)}
              onChange={(event) =>
                onChange({
                  ...value,
                  sendingAddress: `${event.target.value.trim().toLowerCase()}@${
                    selected.domain
                  }`,
                })
              }
              placeholder="support"
            />
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              @{selected.domain}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('mail-sending-from-address-description')}
          </p>
        </div>
      )}

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

      {accounts
        .filter((account) => account.status !== 'verified')
        .map((account) => (
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
