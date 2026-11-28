import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useCan } from '~/modules/auth/session';
import { ChoiceSelect } from './ChoiceSelect';

/** The bank integration each transfer payment reads its statement through. */
const BANK_OF: Record<string, string> = {
  khanbank: 'khanbank-cgw',
  tdbcgw: 'tdb-cgw',
  golomtcgw: 'golomt-cgw',
};

/** Whether the setting is picked from Bank accounts rather than typed. */
export const isBankLinkedChoice = (kind: string, key: string) =>
  kind in BANK_OF && (key === 'connectionId' || key === 'accountNumber');

/** Whether the setting is filled from the chosen account and not shown. */
export const isHiddenBankField = (kind: string, key: string) =>
  kind in BANK_OF && (key === 'iban' || key === 'accountName');

/** Whether the gateway reads through a bank connection and none is chosen yet: its other settings wait. */
export const waitsForConnection = (kind: string, values: Record<string, string | boolean>) =>
  kind in BANK_OF && !values.connectionId;

type Change = (key: string, value: string) => void;

/** The account payers transfer to, from the connection's accounts; its IBAN and name come with it. */
const AccountChoice = ({
  id,
  kind,
  connectionId,
  value,
  onChange,
}: {
  id: string;
  kind: string;
  connectionId: string;
  value: string;
  onChange: Change;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const accounts = useQuery(orpc.banks.accounts.queryOptions({ input: { id: connectionId } }));

  // As in 3.x: TDB offers only its MNT accounts with an IBAN.
  const list = (accounts.data?.data ?? []).filter(
    (account) => kind !== 'tdbcgw' || (account.currency === 'MNT' && !!account.iban),
  );

  if (accounts.isError)
    return (
      <p className="text-sm text-destructive">
        {t(
          'bank-accounts-failed',
          'The bank didn’t list the accounts. Check the connection in Bank accounts.',
        )}
      </p>
    );

  return (
    <ChoiceSelect
      id={id}
      value={value}
      disabled={accounts.isPending}
      placeholder={
        accounts.isPending ? t('loading', 'Loading…') : t('select-account', 'Select account')
      }
      choices={list.map((account) => ({
        value: account.number,
        label:
          kind === 'tdbcgw'
            ? `${account.number} - ${account.name ?? ''}`
            : `${account.name ?? ''} - ${account.iban ?? ''}`,
      }))}
      onChange={(number) => {
        const account = list.find((item) => item.number === number);

        onChange('accountNumber', number);
        onChange('iban', account?.iban ?? '');
        onChange('accountName', account?.name ?? '');
      }}
    />
  );
};

/** The corporate gateway config the payment reads its statement through, from Bank accounts. */
const ConnectionChoice = ({
  id,
  kind,
  value,
  onChange,
}: {
  id: string;
  kind: string;
  value: string;
  onChange: Change;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const bank = BANK_OF[kind] ?? '';
  const connections = useQuery(orpc.banks.connections.queryOptions());

  const own = (connections.data?.data ?? []).filter(
    (item) => item.key === bank && item.status === 'active',
  );

  return (
    <ChoiceSelect
      id={id}
      value={value}
      disabled={connections.isPending}
      placeholder={t('select-config', 'Select config')}
      choices={own.map((item) => ({ value: item.id, label: item.name }))}
      onChange={(connectionId) => {
        onChange('connectionId', connectionId);
        onChange('accountNumber', '');
        onChange('iban', '');
        onChange('accountName', '');
      }}
    />
  );
};

/** A transfer gateway's bank connection or account, picked rather than typed. */
export const BankLinkedChoice = ({
  id,
  kind,
  field,
  values,
  onChange,
}: {
  id: string;
  kind: string;
  field: string;
  values: Record<string, string | boolean>;
  onChange: Change;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const can = useCan();
  const text = (key: string) => (typeof values[key] === 'string' ? values[key] : '');

  if (!can('banks.view'))
    return (
      <p className="text-sm text-muted-foreground">
        {t('bank-needs-view', 'Ask someone who can see bank accounts to set this up.')}
      </p>
    );

  return field === 'accountNumber' ? (
    <AccountChoice
      id={id}
      kind={kind}
      connectionId={text('connectionId')}
      value={text('accountNumber')}
      onChange={onChange}
    />
  ) : (
    <ConnectionChoice id={id} kind={kind} value={text('connectionId')} onChange={onChange} />
  );
};
