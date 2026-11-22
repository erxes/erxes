import type { BankAccount, BankConnection, Statement } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, cn, Input, Label, Select, toIsoDay, useMoney } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { BANK_NAMES } from './bankNames';

/** Which connection the tab shows: the only one, or the one picked. */
export const ConnectionPicker = ({
  connections,
  value,
  onChange,
}: {
  connections: BankConnection[];
  value: string;
  onChange: (id: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.banks' });

  if (connections.length < 2) return null;

  return (
    <Select value={value} onValueChange={onChange}>
      <Select.Trigger aria-label={t('connection', 'Bank connection')} className="w-64">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        {connections.map((connection) => (
          <Select.Item key={connection.id} value={connection.id}>
            {connection.name} · {BANK_NAMES[connection.kind]}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

/** The statement's lines: money in, money out (red), with whom. */
const StatementLines = ({ statement, currency }: { statement: Statement; currency: string }) => {
  const money = useMoney();

  return (
    <ul className="divide-y rounded-lg border text-sm">
      {statement.lines.map((line) => (
        <li key={line.id} className="flex gap-3 px-4 py-2">
          <span className="w-28 shrink-0 text-muted-foreground">
            {line.date?.slice(0, 10) ?? '—'}
          </span>
          <span className="min-w-0 flex-1 break-words">
            {line.description}
            {line.counterparty?.name && (
              <span className="text-muted-foreground"> · {line.counterparty.name}</span>
            )}
          </span>
          <span
            className={cn(
              'shrink-0 tabular-nums',
              line.amount < 0 ? 'text-destructive' : 'text-success',
            )}
          >
            {money(line.amount, currency)}
          </span>
        </li>
      ))}
    </ul>
  );
};

/** A from–to pair of day inputs. */
const DayRange = ({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.banks' });
  const id = useId();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-from`}>{t('from', 'From')}</Label>
        <Input
          id={`${id}-from`}
          type="date"
          value={from}
          max={to}
          onChange={(event) => onChange({ from: event.target.value, to })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-to`}>{t('to', 'To')}</Label>
        <Input
          id={`${id}-to`}
          type="date"
          value={to}
          min={from}
          onChange={(event) => onChange({ from, to: event.target.value })}
        />
      </div>
    </div>
  );
};

/** The last 30 days, as the statement opens. */
const lastMonth = () => ({
  from: toIsoDay(new Date(Date.now() - 30 * 86_400_000)),
  to: toIsoDay(new Date()),
});

/** One account's statement: a date range, its lines, page by page. */
const StatementView = ({ connection, account }: { connection: string; account: BankAccount }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.banks' });
  const [range, setRange] = useState(lastMonth);
  const [page, setPage] = useState(1);

  const statement = useQuery(
    orpc.banks.statement.queryOptions({
      input: { id: connection, account: account.number, ...range, page },
    }),
  );

  return (
    <section className="space-y-3">
      <DayRange
        {...range}
        onChange={(next) => {
          setRange(next);
          setPage(1);
        }}
      />
      <QueryState
        query={statement}
        isEmpty={(data) => data.lines.length === 0}
        empty={
          <p className="text-sm text-muted-foreground">{t('no-lines', 'Nothing in these days.')}</p>
        }
      >
        {(data) => <StatementLines statement={data} currency={account.currency} />}
      </QueryState>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
          <IconChevronLeft />
          {t('newer', 'Newer')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!statement.data?.more}
          onClick={() => setPage(page + 1)}
        >
          {t('older', 'Older')}
          <IconChevronRight />
        </Button>
      </div>
    </section>
  );
};

/** The connection's accounts with their balances; picking one shows its statement. */
export const BankAccounts = ({ connections }: { connections: BankConnection[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.banks' });
  const money = useMoney();
  const [picked, setPicked] = useState(connections[0]?.id ?? '');
  const connection = connections.find((item) => item.id === picked)?.id ?? connections[0]?.id ?? '';
  const [account, setAccount] = useState<BankAccount | null>(null);
  const accounts = useQuery(orpc.banks.accounts.queryOptions({ input: { id: connection } }));

  return (
    <div className="space-y-4">
      <ConnectionPicker
        connections={connections}
        value={connection}
        onChange={(id) => {
          setPicked(id);
          setAccount(null);
        }}
      />
      <QueryState
        query={accounts}
        isEmpty={(data) => data.data.length === 0}
        empty={
          <p className="text-sm text-muted-foreground">
            {t('no-accounts', 'The bank lists no accounts.')}
          </p>
        }
      >
        {(data) => (
          <ul className="divide-y rounded-lg border">
            {data.data.map((item) => (
              <li key={item.number}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted',
                    account?.number === item.number && 'bg-muted',
                  )}
                  onClick={() => setAccount(item)}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{item.name ?? item.number}</span>
                    <span className="block text-xs text-muted-foreground">
                      {[item.number, item.iban, item.currency].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span className="text-right text-sm tabular-nums">
                    {item.balance !== null && (
                      <span className="block">{money(item.balance, item.currency)}</span>
                    )}
                    {item.available !== null && (
                      <span className="block text-xs text-muted-foreground">
                        {t('available', 'Available {{amount}}', {
                          amount: money(item.available, item.currency),
                        })}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </QueryState>
      {account && (
        <StatementView
          key={`${connection}:${account.number}`}
          connection={connection}
          account={account}
        />
      )}
    </div>
  );
};
