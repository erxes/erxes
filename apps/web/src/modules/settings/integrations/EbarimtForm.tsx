import type { EbarimtSettings } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Label, Spinner, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type DraftRule, draftRule, EbarimtRules } from './EbarimtRules';
import { FormSection } from './FormSection';

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
  | 'name'
  | 'posApiUrl'
  | (typeof BUSINESS_FIELDS)[number]['key']
  | (typeof TAX_FIELDS)[number]['key'];

const draftOf = (saved: EbarimtSettings | null) => ({
  text: {
    name: saved?.name ?? '',
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
  rules: (saved?.rules ?? []).map(draftRule),
});

type Draft = ReturnType<typeof draftOf>;

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

/** Toasts what a save did, and refreshes the configs and the Integrations page. */
const useConfigSaved = (onSaved?: (config: EbarimtSettings) => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const { toast } = useToast();
  const client = useQueryClient();

  return {
    onSuccess: (config: EbarimtSettings) => {
      void client.invalidateQueries({ queryKey: orpc.ebarimt.key() });
      void client.invalidateQueries({ queryKey: orpc.integrations.list.key() });
      toast({ title: t('saved', 'eBarimt settings saved') });
      onSaved?.(config);
    },
    onError: (error: unknown) =>
      toast({
        variant: 'destructive',
        title: t('save-failed', 'Could not save'),
        description: messageOf(error),
      }),
  };
};

/** What the form sends: numbers parsed, and rules that name a category or product. */
const inputOf = (draft: Draft, rules: DraftRule[]) => ({
  ...draft.text,
  vatPercent: Number(draft.text.vatPercent || 0),
  cityTaxPercent: Number(draft.text.cityTaxPercent || 0),
  rules: rules
    .filter((rule) => rule.categoryIds.length || rule.productIds.length)
    .map(({ key: _key, ...rule }) => rule),
});

/** The form's groups: connection, business and taxes. */
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
        {field('name', 'Name', 'Main shop')}
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
    </>
  );
};

/** Adds a config, or changes `saved`; the draft starts from it. */
export const EbarimtForm = ({
  saved,
  onSaved,
}: {
  saved: EbarimtSettings | null;
  onSaved?: (config: EbarimtSettings) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const [draft, setDraft] = useState(() => draftOf(saved));
  const saveOptions = useConfigSaved(onSaved);
  const create = useMutation(orpc.ebarimt.createConfig.mutationOptions(saveOptions));
  const update = useMutation(orpc.ebarimt.updateConfig.mutationOptions(saveOptions));
  const pending = create.isPending || update.isPending;
  const { text } = draft;

  const incomplete =
    !text.name || !text.posApiUrl || !text.companyName || !text.merchantTin || !text.districtCode;

  const submit = () => {
    const input = inputOf(draft, draft.rules);

    if (saved) update.mutate({ ...input, id: saved.id, status: saved.status });
    else create.mutate(input);
  };

  return (
    <div className="space-y-6">
      <FormSections draft={draft} onChange={setDraft} />
      <div className="flex justify-end">
        <Button disabled={pending || incomplete} onClick={submit}>
          {pending ? (
            <Spinner size="sm" />
          ) : saved ? (
            t('save', 'Save changes')
          ) : (
            t('create', 'Save config')
          )}
        </Button>
      </div>
    </div>
  );
};
