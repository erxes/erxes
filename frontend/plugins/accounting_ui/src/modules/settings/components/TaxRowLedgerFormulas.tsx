import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, Select, toast } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { useEffect } from 'react';
import { useFieldArray, useForm, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectAccountCategory } from '@/settings/account/account-categories/components/SelectAccountCategory';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import {
  ITaxRowLedgerFormula,
  TTaxRowLedgerFormulasForm,
  taxRowLedgerFormulasFormSchema,
} from '@/settings/types/taxRowReport';

type AccountSide = 'debit' | 'credit';

const KIND_OPTIONS = [
  { value: 'balance', label: 'balance' },
  { value: 'transaction', label: 'transaction' },
] as const;

const PERIOD_OPTIONS = [
  { value: 'first', label: 'period-start' },
  { value: 'last', label: 'period-end' },
  { value: 'between', label: 'within-period' },
] as const;

const DEFAULT_SIDE = 'row';

const newFormula = (): ITaxRowLedgerFormula => ({
  _id: nanoid(),
  kind: 'balance',
  plusOrMinus: true,
  percent: '100',
  getDate: 'last',
});

const ChoiceField = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <Form.Item className="space-y-1">
      <Form.Label>{label}</Form.Label>
      <Select value={value} onValueChange={(next) => onChange(next as T)}>
        <Form.Control>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
        </Form.Control>
        <Select.Content>
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {t(option.label)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </Form.Item>
  );
};

const AccountFields = ({
  form,
  index,
  side,
}: {
  form: UseFormReturn<TTaxRowLedgerFormulasForm>;
  index: number;
  side: AccountSide;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <div className="grid grid-cols-2 gap-2">
      <Form.Field
        control={form.control}
        name={`formulas.${index}.${side}AccountId`}
        render={({ field }) => (
          <Form.Item className="space-y-1">
            <Form.Label>{t(`${side}-account`)}</Form.Label>
            <div className="flex items-center gap-1">
              <SelectAccount.FormItem
                value={field.value}
                onValueChange={(value) =>
                  field.onChange(
                    (Array.isArray(value) ? value[0] : value) || undefined,
                  )
                }
                placeholder={t('choose-account')}
              />
              {field.value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t('clear')}
                  onClick={() => field.onChange(undefined)}
                >
                  ×
                </Button>
              )}
            </div>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name={`formulas.${index}.${side}AccountCategoryId`}
        render={({ field }) => (
          <Form.Item className="space-y-1">
            <Form.Label>{t(`${side}-account-category`)}</Form.Label>
            <Form.Control>
              <SelectAccountCategory
                selected={field.value}
                recordId={field.name}
                nullable
                onSelect={(value) => field.onChange(value || undefined)}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    </div>
  );
};

const LedgerFormulaCard = ({
  form,
  index,
  onRemove,
}: {
  form: UseFormReturn<TTaxRowLedgerFormulasForm>;
  index: number;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('accounting');
  const kind = form.watch(`formulas.${index}.kind`);

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {t('account-formula')} {index + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('delete')}
          onClick={onRemove}
        >
          <IconTrash />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Form.Field
          control={form.control}
          name={`formulas.${index}.kind`}
          render={({ field }) => (
            <ChoiceField
              label={t('formula-type')}
              value={field.value}
              options={KIND_OPTIONS}
              onChange={field.onChange}
            />
          )}
        />
        <Form.Field
          control={form.control}
          name={`formulas.${index}.getDate`}
          render={({ field }) => (
            <ChoiceField
              label={t('period')}
              value={field.value}
              options={PERIOD_OPTIONS}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      <AccountFields form={form} index={index} side="debit" />
      <AccountFields form={form} index={index} side="credit" />
      <div className="grid grid-cols-3 gap-2">
        <Form.Field
          control={form.control}
          name={`formulas.${index}.plusOrMinus`}
          render={({ field }) => (
            <ChoiceField
              label={t('sign')}
              value={field.value ? 'plus' : 'minus'}
              options={[
                { value: 'plus', label: 'add' },
                { value: 'minus', label: 'subtract' },
              ]}
              onChange={(value) => field.onChange(value === 'plus')}
            />
          )}
        />
        <Form.Field
          control={form.control}
          name={`formulas.${index}.percent`}
          render={({ field }) => (
            <Form.Item className="space-y-1">
              <Form.Label>{t('percentage')}</Form.Label>
              <Form.Control>
                <Input {...field} autoComplete="off" />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        {kind === 'transaction' && (
          <Form.Field
            control={form.control}
            name={`formulas.${index}.valueSide`}
            render={({ field }) => (
              <ChoiceField
                label={t('turnover-side')}
                value={field.value || DEFAULT_SIDE}
                options={[
                  { value: DEFAULT_SIDE, label: 'same-as-row' },
                  { value: 'debit', label: 'debit' },
                  { value: 'credit', label: 'credit' },
                ]}
                onChange={(value) =>
                  field.onChange(value === DEFAULT_SIDE ? undefined : value)
                }
              />
            )}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Account formulas of a tax settlement row: balances at the period start or
 * end, or turnovers within the period, like tunable report formulas.
 */
export const TaxRowLedgerFormulas = ({
  formulas,
  saving,
  onSave,
}: {
  formulas: ITaxRowLedgerFormula[];
  saving: boolean;
  onSave: (formulas: ITaxRowLedgerFormula[]) => Promise<boolean>;
}) => {
  const { t } = useTranslation('accounting');
  const form = useForm<TTaxRowLedgerFormulasForm>({
    resolver: zodResolver(taxRowLedgerFormulasFormSchema),
    defaultValues: { formulas },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'formulas',
    keyName: 'fieldKey',
  });

  useEffect(() => {
    form.reset({ formulas });
  }, [form, formulas]);

  const handleSubmit = async (data: TTaxRowLedgerFormulasForm) => {
    if (await onSave(data.formulas)) {
      toast({
        title: t('success'),
        description: t('account-formulas-saved'),
        variant: 'success',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-3 px-4 py-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('account-formulas')}</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append(newFormula())}
          >
            <IconPlus />
            {t('add-account-formula')}
          </Button>
        </div>
        {!fields.length && (
          <p className="text-sm text-muted-foreground">
            {t('account-formulas-empty')}
          </p>
        )}
        {fields.map((field, index) => (
          <LedgerFormulaCard
            key={field.fieldKey}
            form={form}
            index={index}
            onRemove={() => remove(index)}
          />
        ))}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving || !form.formState.isDirty}>
            {saving ? t('saving') : t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
