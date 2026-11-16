import { API_KEY_AREA_INFO, API_KEY_AREAS, type ApiKey } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Badge, Button, Combobox, Command, Form, Input, Label, Popover, cn } from 'erxes-ui';
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContactSelect } from '~/modules/contacts/components/ContactPicker';
import { useKeyCalls } from './useKeyCalls';

type Call = {
  procedure: string;
  method: string;
  path: string;
  summary: string | null;
  area: string | null;
};

const matchWords = (value: string, search: string) =>
  search
    .toLowerCase()
    .split(/\s+/)
    .every((word) => value.toLowerCase().includes(word))
    ? 1
    : 0;

/** The calls a key can make, under their area, with the lists every key reads last. */
const useCallGroups = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.try' });
  const calls = useQuery(orpc.apiKeys.calls.queryOptions());

  return useMemo(() => {
    const all = calls.data?.data ?? [];
    const of = (area: string) => all.filter((call) => call.area === area);

    return [
      ...API_KEY_AREAS.map((area) => ({
        heading: t(`area.${area}`, API_KEY_AREA_INFO[area].label),
        calls: of(area),
      })),
      { heading: t('lookup', 'Lists every key reads'), calls: of('lookup') },
    ].filter((group) => group.calls.length);
  }, [calls.data, t]);
};

const AREAS = new Set<string>(API_KEY_AREAS);

/** The setting on the key's page that decided, in the words the page uses. */
const useRuleLabel = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const { labelOf } = useKeyCalls();

  return (rule: string) => {
    const [head = '', area = ''] = rule.split(':');

    if (head === 'call') return labelOf(area);

    if (head === 'area' && AREAS.has(area)) return t(`try.area.${area}`, area);

    if (head === 'ip') return t('form.ips', 'Only from these addresses');

    if (head === 'expired') return t('form.expires', 'Stops working');

    if (head === 'rows') return t('form.contacts', 'Which contacts');

    if (head === 'kind') return t('form.kind-title', 'What is it for?');

    if (head === 'lookup') return t('try.lookup', 'Lists every key reads');

    if (['permission', 'role', 'member', 'maker'].includes(head)) {
      return t('try.maker-role', "Its maker's role");
    }

    return t('try.never', 'No key can call this');
  };
};

const CallPicker = ({
  value,
  onChange,
}: {
  value: Call | null;
  onChange: (call: Call) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.try' });
  const [open, setOpen] = useState(false);
  const groups = useCallGroups();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className="w-full">
        <Combobox.Value
          value={value ? (value.summary ?? value.procedure) : ''}
          placeholder={t('pick', 'Choose a call, like "list customers"')}
        />
      </Combobox.Trigger>
      <Combobox.Content side="bottom" className="w-96 max-w-full">
        <Command filter={matchWords}>
          <Command.Input
            placeholder={t('search', 'Search calls')}
            variant="secondary"
            focusOnMount
          />
          <Command.List className="max-h-96 overflow-y-auto">
            <Command.Empty>{t('no-match', 'No call matches')}</Command.Empty>
            {groups.map((group) => (
              <Command.Group key={group.heading} heading={group.heading}>
                {group.calls.map((call) => (
                  <Command.Item
                    key={call.procedure}
                    value={`${group.heading} ${call.procedure} ${call.path} ${call.summary ?? ''}`}
                    onSelect={() => {
                      onChange(call);
                      setOpen(false);
                    }}
                  >
                    <span className="min-w-0 flex-1 whitespace-normal">
                      {call.summary ?? call.procedure}
                    </span>
                    <Combobox.Check checked={call.procedure === value?.procedure} />
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

/** "Try this key": would a call pass, from an address, on a contact, and which rule decided. */
export const TryKey = ({ apiKey }: { apiKey: ApiKey }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.try' });
  const recordId = useId();
  const ipId = useId();
  const [call, setCall] = useState<Call | null>(null);
  const [record, setRecord] = useState<string>();
  const [ip, setIp] = useState('');
  const check = useMutation(orpc.apiKeys.try.mutationOptions());

  return (
    <Form.Section
      title={t('title', 'Try this key')}
      description={t('hint', 'Check a call before you use the key. Nothing is called or changed.')}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <div className="min-w-0 space-y-1.5 md:col-span-2">
          <Label>{t('call', 'Call')}</Label>
          <CallPicker
            value={call}
            onChange={(next) => {
              setCall(next);
              setRecord(undefined);
              check.reset();
            }}
          />
        </div>
        {call?.area === 'contacts' && (
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor={recordId}>{t('record', 'On a contact (optional)')}</Label>
            <ContactSelect
              id={recordId}
              kind={call.procedure.startsWith('companies.') ? 'company' : 'customer'}
              value={record}
              onValueChange={(next) => {
                setRecord(next);
                check.reset();
              }}
              noneLabel={t('record-none', 'Any contact')}
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor={ipId}>{t('ip', 'From address (optional)')}</Label>
          <Input
            id={ipId}
            value={ip}
            onChange={(event) => setIp(event.target.value.trim())}
            placeholder={t('ip-placeholder', 'Any address')}
          />
        </div>
      </div>
      <Button
        variant="secondary"
        disabled={!call || check.isPending}
        onClick={() =>
          call &&
          check.mutate({
            id: apiKey.id,
            procedure: call.procedure,
            ...(record && call.area === 'contacts' ? { recordId: record } : {}),
            ...(ip ? { ip } : {}),
          })
        }
      >
        {t('check', 'Check')}
      </Button>
      {check.error && <p className="text-sm text-destructive">{messageOf(check.error)}</p>}
      {check.data && <TryResult result={check.data} />}
    </Form.Section>
  );
};

/** Allowed or refused, why, and the rule that decided. */
const TryResult = ({ result }: { result: { allowed: boolean; rule: string; reason: string } }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.try' });
  const ruleLabel = useRuleLabel();

  return (
    <div
      data-testid="try-result"
      className={cn(
        'flex items-start gap-3 rounded-md border p-4',
        result.allowed
          ? 'border-success/40 bg-success/10'
          : 'border-destructive/40 bg-destructive/10',
      )}
    >
      {result.allowed ? (
        <IconCircleCheck className="mt-0.5 size-5 shrink-0 text-success" />
      ) : (
        <IconCircleX className="mt-0.5 size-5 shrink-0 text-destructive" />
      )}
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold">
          {result.allowed ? t('allowed', 'Allowed') : t('refused', 'Refused')}
        </p>
        <p className="text-sm">{result.reason}</p>
        <Badge variant="muted" title={result.rule}>
          {t('decided-by', 'Decided by: {{setting}}', { setting: ruleLabel(result.rule) })}
        </Badge>
      </div>
    </div>
  );
};
