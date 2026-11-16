import type { EbarimtSettings } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Checkbox, Dialog, Input, Label, Spinner, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type DraftRule, draftRule, EbarimtRules } from './EbarimtRules';

const TEXT_FIELDS = [
  { key: 'posApiUrl', label: 'PosAPI address', placeholder: 'https://posapi.example.mn' },
  { key: 'companyName', label: 'Company name', placeholder: '' },
  { key: 'merchantTin', label: 'Merchant tax number (TIN)', placeholder: '11–14 digits' },
  { key: 'districtCode', label: 'District code', placeholder: '4 digits' },
  { key: 'posNo', label: 'POS number', placeholder: '' },
  { key: 'branchNo', label: 'Branch number', placeholder: '' },
  { key: 'classificationCode', label: 'Product classification code', placeholder: '' },
  { key: 'vatPercent', label: 'VAT %', placeholder: '10' },
  { key: 'cityTaxPercent', label: 'City tax %', placeholder: '0' },
] as const;

type TextKey = (typeof TEXT_FIELDS)[number]['key'];

const draftOf = (saved: EbarimtSettings | null) => ({
  text: {
    posApiUrl: saved?.posApiUrl ?? '',
    companyName: saved?.companyName ?? '',
    merchantTin: saved?.merchantTin ?? '',
    districtCode: saved?.districtCode ?? '',
    posNo: saved?.posNo ?? '',
    branchNo: saved?.branchNo ?? '',
    classificationCode: saved?.classificationCode ?? '',
    vatPercent: String(saved?.vatPercent ?? 10),
    cityTaxPercent: String(saved?.cityTaxPercent ?? 0),
  } satisfies Record<TextKey, string>,
  plugins: saved?.plugins ?? [],
  rules: (saved?.rules ?? []).map(draftRule),
});

/** The plugins that take payments here: each one's paid invoices may get receipts. */
const PluginChoice = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (plugins: string[]) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const id = useId();
  const plugins = useQuery(orpc.ebarimt.plugins.queryOptions());
  const rows = plugins.data?.data ?? [];
  const own = rows.filter((row) => row.ownReceipts);

  return (
    <div className="space-y-2">
      <Label>{t('plugins', 'Issue receipts for invoices of')}</Label>
      {plugins.isError && (
        <p className="text-xs text-destructive">
          {t('plugins-failed', 'Could not load the plugins that take payments.')}
        </p>
      )}
      {plugins.isSuccess && !rows.length && (
        <p className="text-xs text-muted-foreground">
          {t('no-plugins', 'No installed plugin takes payments yet.')}
        </p>
      )}
      <div className="flex flex-wrap gap-4">
        {rows.map((row) => (
          <span key={row.plugin} className="flex items-center gap-2 text-sm">
            <Checkbox
              id={`${id}-${row.plugin}`}
              disabled={row.ownReceipts}
              checked={value.includes(row.plugin)}
              onCheckedChange={(on) =>
                onChange(on ? [...value, row.plugin] : value.filter((name) => name !== row.plugin))
              }
            />
            <label htmlFor={`${id}-${row.plugin}`}>{row.title}</label>
          </span>
        ))}
      </div>
      {own.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('own-receipts', {
            defaultValue:
              '{{plugins}} send their own eBarimt receipts, so core issues none for them.',
            plugins: own.map((row) => row.title).join(', '),
          })}
        </p>
      )}
    </div>
  );
};

/** Asks the PosAPI at the typed address for its state. */
const TestConnection = ({ posApiUrl }: { posApiUrl: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const { toast } = useToast();

  const test = useMutation(
    orpc.ebarimt.testConnection.mutationOptions({
      onSuccess: (result) =>
        toast(
          result.ok
            ? { title: t('test-ok', 'PosAPI answered') }
            : {
                variant: 'destructive',
                title: t('test-failed', 'PosAPI did not answer'),
                description: result.error ?? undefined,
              },
        ),
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('test-failed', 'PosAPI did not answer'),
          description: messageOf(error),
        }),
    }),
  );

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={!posApiUrl || test.isPending}
      onClick={() => test.mutate({ posApiUrl })}
    >
      {test.isPending ? <Spinner size="sm" /> : t('test', 'Test connection')}
    </Button>
  );
};

const useSave = (onSaved: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const { toast } = useToast();
  const client = useQueryClient();

  return useMutation(
    orpc.ebarimt.saveSettings.mutationOptions({
      onSuccess: () => {
        void client.invalidateQueries({ queryKey: orpc.ebarimt.settings.key() });
        toast({ title: t('saved', 'eBarimt settings saved') });
        onSaved();
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('save-failed', 'Could not save'),
          description: messageOf(error),
        }),
    }),
  );
};

/** What the form sends: numbers parsed, and rules that name a category or product. */
const inputOf = (draft: ReturnType<typeof draftOf>, rules: DraftRule[]) => ({
  ...draft.text,
  vatPercent: Number(draft.text.vatPercent || 0),
  cityTaxPercent: Number(draft.text.cityTaxPercent || 0),
  plugins: draft.plugins,
  rules: rules
    .filter((rule) => rule.categoryIds.length || rule.productIds.length)
    .map(({ key: _key, ...rule }) => rule),
});

/** Mounted while the dialog is open, so closing it drops unsaved changes. */
const EbarimtFormBody = ({
  saved,
  onSaved,
}: {
  saved: EbarimtSettings | null;
  onSaved: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const id = useId();
  const [draft, setDraft] = useState(() => draftOf(saved));
  const save = useSave(onSaved);
  const { text } = draft;

  const incomplete =
    !text.posApiUrl || !text.companyName || !text.merchantTin || !text.districtCode;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {TEXT_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} className={key === 'posApiUrl' ? 'col-span-2 space-y-1.5' : 'space-y-1.5'}>
            <Label htmlFor={`${id}-${key}`}>{t(`field.${key}`, label)}</Label>
            <Input
              id={`${id}-${key}`}
              value={text[key]}
              placeholder={placeholder}
              inputMode={key.endsWith('Percent') ? 'decimal' : undefined}
              onChange={(event) =>
                setDraft({ ...draft, text: { ...text, [key]: event.target.value } })
              }
            />
          </div>
        ))}
      </div>
      <TestConnection posApiUrl={text.posApiUrl} />
      <PluginChoice value={draft.plugins} onChange={(plugins) => setDraft({ ...draft, plugins })} />
      <EbarimtRules rules={draft.rules} onChange={(rules) => setDraft({ ...draft, rules })} />
      <Button
        className="w-full"
        disabled={save.isPending || incomplete}
        onClick={() => save.mutate({ ...inputOf(draft, draft.rules), status: saved?.status })}
      >
        {save.isPending ? <Spinner size="sm" /> : t('save', 'Save')}
      </Button>
    </div>
  );
};

/** Sets eBarimt up, or changes its settings. */
export const EbarimtForm = ({ saved }: { saved: EbarimtSettings | null }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<Button variant={saved ? 'secondary' : 'default'} />}>
        {saved ? t('change', 'Settings') : t('set-up-short', 'Set up')}
      </Dialog.Trigger>
      <Dialog.Content className="max-w-2xl">
        <Dialog.HeaderCombined
          title={saved ? t('edit', 'eBarimt settings') : t('set-up', 'Set up eBarimt')}
          description={t(
            'form-description',
            'Receipts go to your PosAPI 3.0, which reports them to the tax office.',
          )}
        />
        {open && <EbarimtFormBody saved={saved} onSaved={() => setOpen(false)} />}
      </Dialog.Content>
    </Dialog>
  );
};
