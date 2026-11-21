import type { IntegrationConnectResult, IntegrationPick } from '@erxes/core-contract';
import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';
import { IconSearch } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Checkbox, Empty, InputGroup, Spinner, useFormat, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { integrationPath, type PluginIntegrationEntry } from '../catalog';
import { IntegrationShell } from '../IntegrationLayout';
import { useAccountsChanged, useCloseStep, useConnect, useKindText } from './accountState';
import { FailedAccounts, StepHeader } from './ConnectForm';

type Candidate = IntegrationPick['candidates'][number];

const SEARCH_FROM = 7;

const keyOf = (candidate: Pick<Candidate, 'kind' | 'externalId'>) =>
  `${candidate.kind}:${candidate.externalId}`;

const CandidateRow = ({
  candidate,
  checked,
  disabled,
  onToggle,
}: {
  candidate: Candidate;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const id = useId();

  return (
    <li className="flex items-center gap-3 p-3">
      <Checkbox id={id} checked={checked} disabled={disabled} onCheckedChange={onToggle} />
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer text-sm">
        <span className="block truncate font-medium">{candidate.name}</span>
        {candidate.detail && (
          <span className="block truncate text-xs text-muted-foreground">{candidate.detail}</span>
        )}
      </label>
      {candidate.connected && (
        <Badge variant="secondary">{t('already-connected', 'Connected')}</Badge>
      )}
    </li>
  );
};

const usePickForm = (integration: PluginIntegrationEntry, pick: IntegrationPick) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const { toast } = useToast();
  const close = useCloseStep();
  const changed = useAccountsChanged();
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [failed, setFailed] = useState<IntegrationConnectResult['failed']>([]);

  const [chosen, setChosen] = useState(() => new Set<string>());
  const picked = pick.candidates.filter((item) => !item.connected && chosen.has(keyOf(item)));
  const connected = pick.candidates.filter((item) => item.connected);

  const failure = (title: string) => (error: Error) =>
    toast({ variant: 'destructive', title, description: messageOf(error) });

  const confirm = useMutation(
    orpc.integrationAccounts.confirmPick.mutationOptions({
      onSuccess: (result) => {
        setFailed(result.failed);

        const added = result.connected.filter((account) => chosen.has(keyOf(account))).length;

        if (added) toast({ title: t('connected-count', '{{count}} connected', { count: added }) });
        else if (result.connected.length) {
          toast({ title: t('updated', 'Connected accounts updated') });
        }

        if (!result.failed.length) close();
        else void client.invalidateQueries({ queryKey: orpc.integrationAccounts.pick.key() });

        return changed();
      },
      onError: failure(t('pick-failed', 'Could not connect')),
    }),
  );

  const cancel = useMutation(
    orpc.integrationAccounts.cancelPick.mutationOptions({
      onSuccess: close,
      onError: failure(t('cancel-failed', 'Could not cancel')),
    }),
  );

  const needle = search.trim().toLocaleLowerCase();

  const shown = pick.candidates.filter((item) =>
    [item.name, item.detail ?? ''].some((part) => part.toLocaleLowerCase().includes(needle)),
  );

  const open = shown.filter((item) => !item.connected);

  const toggle = (keys: string[], on: boolean) =>
    setChosen(
      (current) =>
        new Set(on ? [...current, ...keys] : [...current].filter((key) => !keys.includes(key))),
    );

  return {
    search,
    setSearch,
    shown,
    open,
    chosen,
    toggle,
    failed,
    picked: picked.length,
    refreshed: connected.length,
    allOpen: open.length > 0 && open.every((item) => chosen.has(keyOf(item))),
    busy: confirm.isPending || cancel.isPending,
    confirming: confirm.isPending,
    confirm: () =>
      confirm.mutate({
        id: pick.id,
        chosen: [...connected, ...picked].map(({ kind, externalId }) => ({ kind, externalId })),
      }),
    cancel: () => cancel.mutate({ id: pick.id }),
    kinds: integration.definition.accounts.map((item) => item.kind),
  };
};

type PickForm = ReturnType<typeof usePickForm>;

const PickToolbar = ({ form, total }: { form: PickForm; total: number }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const searchId = useId();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {total >= SEARCH_FROM && (
        <InputGroup className="min-w-48 flex-1">
          <InputGroup.Addon>
            <IconSearch />
          </InputGroup.Addon>
          <InputGroup.Input
            id={searchId}
            type="search"
            value={form.search}
            aria-label={t('pick-search', 'Search')}
            placeholder={t('pick-search-count', 'Search {{count}}…', { count: total })}
            onChange={(event) => form.setSearch(event.target.value)}
          />
        </InputGroup>
      )}
      <Button
        variant="ghost"
        size="sm"
        disabled={form.busy || !form.open.length}
        onClick={() => form.toggle(form.open.map(keyOf), !form.allOpen)}
      >
        {form.allOpen ? t('pick-none', 'Untick all') : t('pick-all', 'Tick all')}
      </Button>
    </div>
  );
};

const PickGroups = ({
  integration,
  form,
}: {
  integration: PluginIntegrationEntry;
  form: PickForm;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const kindText = useKindText(integration);

  if (!form.shown.length) {
    return (
      <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
        {t('pick-no-match', 'Nothing matches “{{search}}”.', { search: form.search })}
      </p>
    );
  }

  return form.kinds.map((kind) => {
    const rows = form.shown.filter((item) => item.kind === kind);

    return rows.length ? (
      <section key={kind} className="space-y-2">
        {kindText.several && <h2 className="text-sm font-medium">{kindText.plural(kind)}</h2>}
        <ul className="divide-y rounded-lg border">
          {rows.map((candidate) => (
            <CandidateRow
              key={keyOf(candidate)}
              candidate={candidate}
              checked={candidate.connected || form.chosen.has(keyOf(candidate))}
              disabled={form.busy || candidate.connected}
              onToggle={() => form.toggle([keyOf(candidate)], !form.chosen.has(keyOf(candidate)))}
            />
          ))}
        </ul>
      </section>
    ) : null;
  });
};

const PickList = ({
  integration,
  pick,
}: {
  integration: PluginIntegrationEntry;
  pick: IntegrationPick;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const format = useFormat();
  const form = usePickForm(integration, pick);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <StepHeader
        title={t('pick-title', 'Choose what to connect')}
        description={t(
          'pick-description',
          'Tick what to connect. What is connected already gets this new sign-in. This list is kept until {{time}}.',
          { time: format.time(pick.expiresAt) },
        )}
        actions={
          <>
            <Button variant="outline" disabled={form.busy} onClick={form.cancel}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              disabled={form.busy || (!form.picked && !form.refreshed)}
              onClick={form.confirm}
            >
              {form.confirming ? (
                <Spinner size="sm" />
              ) : form.picked ? (
                t('pick-confirm', 'Connect {{count}}', { count: form.picked })
              ) : (
                t('pick-update', 'Update connected')
              )}
            </Button>
          </>
        }
      />
      <FailedAccounts failed={form.failed} />
      <PickToolbar form={form} total={pick.candidates.length} />
      <PickGroups integration={integration} form={form} />
    </div>
  );
};

const PickGone = ({ integration }: { integration: PluginIntegrationEntry }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const close = useCloseStep();
  const { connect, pending } = useConnect(integration);

  return (
    <Empty variant="outline">
      <Empty.Header>
        <Empty.Title>{t('pick-gone', 'This sign-in ran out of time')}</Empty.Title>
        <Empty.Description>
          {t('pick-gone-description', 'Nothing was connected. Connect again to get a new list.')}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <div className="flex gap-2">
          <Button variant="outline" onClick={close}>
            {t('back', 'Back to accounts')}
          </Button>
          <Button disabled={pending} onClick={connect}>
            {pending ? <Spinner size="sm" /> : t('connect-again', 'Connect again')}
          </Button>
        </div>
      </Empty.Content>
    </Empty>
  );
};

export const PickStep = ({
  integration,
  pickId,
}: {
  integration: PluginIntegrationEntry;
  pickId: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });

  const pick = useQuery(
    orpc.integrationAccounts.pick.queryOptions({
      input: { id: pickId },
      retry: false,
      refetchOnWindowFocus: false,
    }),
  );

  const gone =
    isApiError(pick.error, 'PICK_EXPIRED') ||
    isApiError(pick.error, 'NOT_FOUND') ||
    (pick.data !== undefined && pick.data.integration !== integration.key);

  return (
    <IntegrationShell
      integration={integration}
      step={{
        label: t('pick-step', 'Choose'),
        to: `${integrationPath(integration)}?pick=${encodeURIComponent(pickId)}`,
      }}
    >
      {gone ? (
        <PickGone integration={integration} />
      ) : (
        <QueryState query={pick}>
          {(data) => <PickList key={data.id} integration={integration} pick={data} />}
        </QueryState>
      )}
    </IntegrationShell>
  );
};
