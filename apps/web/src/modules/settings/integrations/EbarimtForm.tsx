import type { EbarimtSettings } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Checkbox, Input, Label, Spinner, useToast } from 'erxes-ui';
import { type ReactNode, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type DraftRule, draftRule, EbarimtRules } from './EbarimtRules';

const BUSINESS_FIELDS = [
  { key: 'companyName', label: 'Company name', placeholder: '' },
  { key: 'merchantTin', label: 'Merchant tax number (TIN)', placeholder: '11–14 digits' },
  { key: 'districtCode', label: 'District code', placeholder: '4 digits' },
  { key: 'posNo', label: 'POS number', placeholder: '' },
  { key: 'branchNo', label: 'Branch number', placeholder: '' },
] as const;

const TAX_FIELDS = [
  { key: 'vatPercent', label: 'VAT %', placeholder: '10' },
  { key: 'cityTaxPercent', label: 'City tax %', placeholder: '0' },
  { key: 'classificationCode', label: 'Product classification code', placeholder: '' },
] as const;

type TextKey =
  | 'posApiUrl'
  | (typeof BUSINESS_FIELDS)[number]['key']
  | (typeof TAX_FIELDS)[number]['key'];

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

type Draft = ReturnType<typeof draftOf>;

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

const useSave = (onSaved?: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const { toast } = useToast();
  const client = useQueryClient();

  return useMutation(
    orpc.ebarimt.saveSettings.mutationOptions({
      onSuccess: () => {
        void client.invalidateQueries({ queryKey: orpc.ebarimt.settings.key() });
        toast({ title: t('saved', 'eBarimt settings saved') });
        onSaved?.();
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
const inputOf = (draft: Draft, rules: DraftRule[]) => ({
  ...draft.text,
  vatPercent: Number(draft.text.vatPercent || 0),
  cityTaxPercent: Number(draft.text.cityTaxPercent || 0),
  plugins: draft.plugins,
  rules: rules
    .filter((rule) => rule.categoryIds.length || rule.productIds.length)
    .map(({ key: _key, ...rule }) => rule),
});

/** The form's groups: connection, business, taxes and plugins. */
const FormSections = ({
  draft,
  onChange: setDraft,
}: {
  draft: Draft;
  onChange: (draft: Draft) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const id = useId();
  const { text } = draft;

  const field = (key: TextKey, label: string, placeholder: string) => (
    <div key={key} className="space-y-1.5">
      <Label htmlFor={`${id}-${key}`}>{t(`field.${key}`, label)}</Label>
      <Input
        id={`${id}-${key}`}
        value={text[key]}
        placeholder={placeholder}
        inputMode={key.endsWith('Percent') ? 'decimal' : undefined}
        onChange={(event) => setDraft({ ...draft, text: { ...text, [key]: event.target.value } })}
      />
    </div>
  );

  return (
    <>
      <FormSection
        title={t('section.connection', 'Connection')}
        description={t(
          'form-description',
          'Receipts go to your PosAPI 3.0, which reports them to the tax office.',
        )}
      >
        {field('posApiUrl', 'PosAPI address', 'https://posapi.example.mn')}
        <TestConnection posApiUrl={text.posApiUrl} />
      </FormSection>
      <FormSection
        title={t('section.business', 'Business')}
        description={t('section.business-description', 'As registered with the tax office.')}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {BUSINESS_FIELDS.map(({ key, label, placeholder }) => field(key, label, placeholder))}
        </div>
      </FormSection>
      <FormSection
        title={t('section.taxes', 'Taxes')}
        description={t(
          'section.taxes-description',
          'The rates every line takes, and rules for the products taxed otherwise.',
        )}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {TAX_FIELDS.map(({ key, label, placeholder }) => field(key, label, placeholder))}
        </div>
        <EbarimtRules rules={draft.rules} onChange={(rules) => setDraft({ ...draft, rules })} />
      </FormSection>
      <FormSection
        title={t('section.plugins', 'Plugins')}
        description={t(
          'section.plugins-description',
          'Paid invoices of these plugins get receipts, whether paid through a gateway or in cash.',
        )}
      >
        <PluginChoice
          value={draft.plugins}
          onChange={(plugins) => setDraft({ ...draft, plugins })}
        />
      </FormSection>
    </>
  );
};

/** Sets eBarimt up, or changes its settings; the draft starts from `saved`. */
export const EbarimtForm = ({
  saved,
  onSaved,
}: {
  saved: EbarimtSettings | null;
  onSaved?: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const [draft, setDraft] = useState(() => draftOf(saved));
  const save = useSave(onSaved);
  const { text } = draft;

  const incomplete =
    !text.posApiUrl || !text.companyName || !text.merchantTin || !text.districtCode;

  return (
    <div className="space-y-6">
      <FormSections draft={draft} onChange={setDraft} />
      <div className="flex justify-end">
        <Button
          disabled={save.isPending || incomplete}
          onClick={() => save.mutate({ ...inputOf(draft, draft.rules), status: saved?.status })}
        >
          {save.isPending ? (
            <Spinner size="sm" />
          ) : saved ? (
            t('save', 'Save changes')
          ) : (
            t('set-up', 'Set up eBarimt')
          )}
        </Button>
      </div>
    </div>
  );
};

/** A settings group: what it is on the left, its fields on the right. */
const FormSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <section className="grid gap-4 border-b pb-6 md:grid-cols-3">
    <div className="space-y-1">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <div className="space-y-3 md:col-span-2">{children}</div>
  </section>
);
