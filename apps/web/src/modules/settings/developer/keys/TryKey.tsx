import { API_KEY_AREAS, type ApiKey } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconSearch, IconShieldCheck } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Input, InputGroup, Label, Spinner } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContactSelect } from '~/modules/contacts/components/ContactPicker';
import { AreaCalls, type CheckRow } from './CheckRows';
import { useKeyCalls } from './useKeyCalls';

/** Every call the key can be given, with its decision and its area. */
const useDecisions = (apiKey: ApiKey, ip: string, recordId: string | undefined) => {
  const { all, labelOf } = useKeyCalls();

  const query = useQuery(
    orpc.apiKeys.try.queryOptions({
      input: { id: apiKey.id, ...(ip ? { ip } : {}), ...(recordId ? { recordId } : {}) },
      placeholderData: (previous) => previous,
    }),
  );

  const calls = new Map(all.map((call) => [call.name, call]));

  const rows: CheckRow[] = (query.data?.data ?? []).map((decision) => ({
    ...decision,
    label: labelOf(decision.procedure),
    method: calls.get(decision.procedure)?.method ?? '',
    area: calls.get(decision.procedure)?.area ?? 'lookup',
  }));

  return { query, rows };
};

/** What-if inputs: an address the key calls from, a contact it calls on. */
const WhatIf = ({
  ip,
  record,
  onIp,
  onRecord,
}: {
  ip: string;
  record: string | undefined;
  onIp: (ip: string) => void;
  onRecord: (id: string | undefined) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.try' });
  const ipId = useId();
  const recordId = useId();

  return (
    <section className="space-y-3 rounded-lg border bg-background p-5">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{t('what-if', 'Check a situation')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('what-if-hint', 'Would it still work from another address, or on one customer?')}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={ipId}>{t('ip', 'Calling from')}</Label>
          <Input
            id={ipId}
            value={ip}
            onChange={(event) => onIp(event.target.value.trim())}
            placeholder={t('ip-placeholder', 'Any address, or type one like 203.0.113.7')}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={recordId}>{t('record', 'On a customer')}</Label>
          <ContactSelect
            id={recordId}
            kind="customer"
            value={record}
            onValueChange={onRecord}
            noneLabel={t('record-none', 'Any customer')}
          />
        </div>
      </div>
    </section>
  );
};

/** An address once it looks complete, so typing doesn't ask the server on every key. */
const IP = /^(\d{1,3}\.){3}\d{1,3}$|^[\da-f]*:[\da-f:]*:[\da-f]*$/i;

/**
 * "Check access": how many API calls the key may make, which ones by area, and why the rest are
 * refused, from an address and on a customer if given. Nothing is called or changed.
 */
export const TryKey = ({ apiKey }: { apiKey: ApiKey }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.try' });
  const [ip, setIp] = useState('');
  const [record, setRecord] = useState<string>();
  const [search, setSearch] = useState('');
  const { query, rows } = useDecisions(apiKey, IP.test(ip) ? ip : '', record);
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  const allowed = rows.filter((row) => row.allowed).length;

  const shown = rows.filter((row) =>
    words.every((word) => `${row.label} ${row.procedure}`.toLowerCase().includes(word)),
  );

  return (
    <div className="space-y-4">
      <section className="flex items-start gap-4 rounded-lg border bg-background p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <IconShieldCheck size={20} />
        </span>
        <div className="space-y-1">
          <h2 className="text-base font-semibold" data-testid="check-headline">
            {query.isPending
              ? t('checking', 'Checking {{name}}…', { name: apiKey.name })
              : t('headline', '{{name}} can make {{count}} of {{total}} API calls', {
                  name: apiKey.name,
                  count: allowed,
                  total: rows.length,
                })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t(
              'hint',
              "See what this key can and can't do before you hand it out. Nothing is called or changed.",
            )}
          </p>
        </div>
      </section>
      <WhatIf ip={ip} record={record} onIp={setIp} onRecord={setRecord} />
      <InputGroup>
        <InputGroup.Addon>
          <IconSearch className="pointer-events-none size-3.5" />
        </InputGroup.Addon>
        <InputGroup.Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('search', 'Search calls')}
          aria-label={t('search', 'Search calls')}
        />
      </InputGroup>
      {query.error && <p className="text-sm text-destructive">{messageOf(query.error)}</p>}
      {query.isPending ? (
        <Spinner className="mx-auto my-12" />
      ) : (
        <div key={words.length ? 'searching' : 'browsing'} className="space-y-3">
          {[...API_KEY_AREAS, 'lookup'].map((area) => {
            const inArea = shown.filter((row) => row.area === area);

            return inArea.length ? (
              <AreaCalls key={area} area={area} rows={inArea} searching={words.length > 0} />
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};
