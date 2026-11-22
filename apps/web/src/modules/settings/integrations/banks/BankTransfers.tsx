import type { BankConnection } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconSend } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Dialog,
  fromAmountInput,
  Input,
  Label,
  Spinner,
  useMoney,
  useToast,
} from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useCan } from '~/modules/auth/session';
import { ConnectionPicker } from './BankAccounts';

const STATUS_VARIANT = { sent: 'success', failed: 'destructive', sending: 'warning' } as const;

/** Typed amount (12.50) in the currency's smallest unit (1250); null when it isn't one. */
const minorOf = (text: string, currency: string) => {
  const amount = /^[A-Z]{3}$/u.test(currency)
    ? fromAmountInput(text.replace(/[\s,]/gu, ''), currency)
    : Number.NaN;

  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
};

type Draft = {
  fromAccount: string;
  toAccount: string;
  toBank: string;
  toAccountName: string;
  amount: string;
  currency: string;
  description: string;
  loginName: string;
  password: string;
};

const EMPTY: Draft = {
  fromAccount: '',
  toAccount: '',
  toBank: '',
  toAccountName: '',
  amount: '',
  currency: 'MNT',
  description: '',
  loginName: '',
  password: '',
};

const FIELDS: {
  key: keyof Draft;
  label: string;
  secret?: boolean;
  khanbank?: boolean;
  optional?: boolean;
}[] = [
  { key: 'fromAccount', label: 'From account' },
  { key: 'toAccount', label: 'To account' },
  { key: 'toBank', label: 'Their bank’s code (another bank only)', optional: true },
  { key: 'toAccountName', label: 'Account holder’s name', optional: true },
  { key: 'amount', label: 'Amount' },
  { key: 'currency', label: 'Currency' },
  { key: 'description', label: 'Description' },
  { key: 'loginName', label: 'Your Khan Bank internet bank login', khanbank: true },
  { key: 'password', label: 'Your Khan Bank internet bank password', secret: true, khanbank: true },
];

/** The transfer the draft makes, or null while something's missing. */
const transferOf = (connection: BankConnection, draft: Draft, reference: string) => {
  const amount = minorOf(draft.amount, draft.currency);
  const interbank = draft.toBank.trim() !== '';

  if (!amount || !draft.fromAccount || !draft.toAccount || !draft.description.trim()) return null;

  if (interbank && !draft.toAccountName.trim()) return null;

  if (connection.kind === 'khanbank' && (!draft.loginName || !draft.password)) return null;

  return {
    id: connection.id,
    reference,
    type: interbank ? ('interbank' as const) : ('domestic' as const),
    fromAccount: draft.fromAccount.trim(),
    toAccount: draft.toAccount.trim(),
    amount,
    currency: draft.currency.trim().toUpperCase(),
    description: draft.description.trim(),
    ...(interbank && { toBank: draft.toBank.trim(), toAccountName: draft.toAccountName.trim() }),
    ...(connection.kind === 'khanbank' && {
      sender: { loginName: draft.loginName, password: draft.password },
    }),
  };
};

type Transfer = NonNullable<ReturnType<typeof transferOf>>;

/** The transfer as it will go, and the last chance to stop it. */
const Review = ({
  transfer,
  sending,
  onBack,
  onSend,
}: {
  transfer: Transfer;
  sending: boolean;
  onBack: () => void;
  onSend: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.banks' });
  const money = useMoney();

  return (
    <div className="space-y-3 text-sm">
      <p className="text-base font-medium">{money(transfer.amount, transfer.currency)}</p>
      <p>
        {t('review-line', 'From {{from}} to {{to}}', {
          from: transfer.fromAccount,
          to: transfer.toAccount,
        })}
        {transfer.toBank &&
          ` · ${t('review-bank', 'bank {{code}}', { code: transfer.toBank })} · ${transfer.toAccountName ?? ''}`}
      </p>
      <p className="text-muted-foreground">{transfer.description}</p>
      <p className="text-xs text-muted-foreground">
        {t('review-warning', 'Money sent can’t be called back from here.')}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" disabled={sending} onClick={onBack}>
          {t('back', 'Back')}
        </Button>
        <Button className="flex-1" disabled={sending} onClick={onSend}>
          {sending ? <Spinner size="sm" /> : t('send-now', 'Send now')}
        </Button>
      </div>
    </div>
  );
};

const useSend = (onDone: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.banks' });
  const { toast } = useToast();
  const client = useQueryClient();

  return useMutation(
    orpc.banks.transfer.mutationOptions({
      onSuccess: (sent) => {
        void client.invalidateQueries({ queryKey: orpc.banks.key() });
        toast(
          sent.status === 'sent'
            ? { title: t('sent', 'Sent'), description: sent.bankReference ?? undefined }
            : {
                variant: 'destructive',
                title: t('refused', 'The bank refused it'),
                description: sent.error ?? undefined,
              },
        );
        onDone();
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('send-failed', 'Not sent'),
          description: messageOf(error),
        }),
    }),
  );
};

/**
 * Sends money: fill in, review, confirm. The reference is made once per form,
 * so a double click or a retry is refused by core instead of sent twice.
 */
const SendMoneyForm = ({
  connection,
  onDone,
}: {
  connection: BankConnection;
  onDone: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.banks' });
  const id = useId();
  const [reference] = useState(() => `erxes-${crypto.randomUUID()}`);
  const [draft, setDraft] = useState(EMPTY);
  const [reviewing, setReviewing] = useState(false);
  const send = useSend(onDone);
  const transfer = transferOf(connection, draft, reference);

  if (reviewing && transfer)
    return (
      <Review
        transfer={transfer}
        sending={send.isPending}
        onBack={() => setReviewing(false)}
        onSend={() => send.mutate(transfer)}
      />
    );

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();

        if (transfer) setReviewing(true);
      }}
    >
      {FIELDS.filter((field) => !field.khanbank || connection.kind === 'khanbank').map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label htmlFor={`${id}-${field.key}`}>
            {t(`transfer-${field.key}`, field.label)}
            {field.optional && (
              <span className="text-muted-foreground"> {t('optional', '(optional)')}</span>
            )}
          </Label>
          <Input
            id={`${id}-${field.key}`}
            type={field.secret ? 'password' : 'text'}
            autoComplete="off"
            value={draft[field.key]}
            onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
          />
        </div>
      ))}
      <Button type="submit" className="w-full" disabled={!transfer}>
        {t('review', 'Review')}
      </Button>
    </form>
  );
};

/** Money sent from the organisation's accounts, newest first; sending for those allowed. */
export const BankTransfers = ({ connections }: { connections: BankConnection[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.banks' });
  const money = useMoney();
  const can = useCan();
  const [open, setOpen] = useState(false);
  const senders = connections.filter((connection) => connection.transfers);
  const [picked, setPicked] = useState(senders[0]?.id ?? '');
  const connection = senders.find((item) => item.id === picked) ?? senders[0];
  const transfers = useQuery(orpc.banks.transfers.queryOptions({ input: { limit: 50 } }));

  return (
    <div className="space-y-4">
      {can('banks.transfer') && connection && (
        <div className="flex flex-wrap items-center gap-2">
          <ConnectionPicker connections={senders} value={connection.id} onChange={setPicked} />
          <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Trigger render={<Button />}>
              <IconSend />
              {t('send', 'Send money')}
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.HeaderCombined
                title={t('send-from', 'Send money from {{name}}', { name: connection.name })}
                description={t(
                  'send-description',
                  'Every transfer is kept with who sent it. Khan Bank asks for your internet bank login each time; it isn’t stored.',
                )}
              />
              {open && (
                <SendMoneyForm
                  key={connection.id}
                  connection={connection}
                  onDone={() => setOpen(false)}
                />
              )}
            </Dialog.Content>
          </Dialog>
        </div>
      )}
      <QueryState
        query={transfers}
        isEmpty={(data) => data.data.length === 0}
        empty={
          <p className="text-sm text-muted-foreground">
            {t('no-transfers', 'No money sent from here yet.')}
          </p>
        }
      >
        {(data) => (
          <ul className="divide-y rounded-lg border text-sm">
            {data.data.map((row) => (
              <li key={row.id} className="flex items-center gap-3 px-4 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block">{row.description}</span>
                  <span className="block text-xs text-muted-foreground">
                    {row.fromAccount} → {row.toAccount}
                    {row.error && ` · ${row.error}`}
                  </span>
                </span>
                <span className="tabular-nums">{money(row.amount, row.currency)}</span>
                <Badge variant={STATUS_VARIANT[row.status]}>
                  {t(`status-${row.status}`, row.status)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </QueryState>
    </div>
  );
};
