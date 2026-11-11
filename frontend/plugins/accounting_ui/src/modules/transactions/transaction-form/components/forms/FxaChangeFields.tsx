import { getFxaTaxLabel } from '@/adjustments/fxa/utils/fxaTaxLabels';
import {
  Form,
  Input,
  PopoverScoped,
  RecordTableInlineCell,
  Select,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ITransactionGroupForm } from '@/transactions/transaction-form/types/JournalForms';
import { FIXED_ASSET_DEPRECIATION_METHODS } from '@/settings/fixed-assets/constants/depreciationMethods';
import {
  getRateFromUsefulLife,
  getUsefulLifeFromRate,
} from '@/settings/fixed-assets/utils/depreciationRate';

export interface IFxaChangeFieldProps {
  form: ITransactionGroupForm;
  index: number;
  detailIndex: number;
}

export const FxaChangeNumberField = ({
  form,
  index,
  detailIndex,
  rule,
  label,
  compact = false,
  usefulYears = false,
  labelOverride,
}: IFxaChangeFieldProps & {
  rule:
    | 'revaluationLoss'
    | 'revaluationReserve'
    | 'taxAnnualDepreciationRate'
    | 'taxSalvageValue'
    | 'taxPreDeprecation'
    | 'originalCost'
    | 'preDeprecation'
    | 'salvageValue'
    | 'annualDepreciationRate';
  label: string;
  compact?: boolean;
  usefulYears?: boolean;
  labelOverride?: string;
}) => {
  const { t } = useTranslation('accounting');
  const fieldLabel =
    labelOverride ??
    (rule === 'revaluationLoss' || rule === 'revaluationReserve'
      ? `${t('total-amount')} ${t(label)}`
      : getFxaTaxLabel(t, label));
  return (
    <Form.Field
      control={form.control}
      name={`trDocs.${index}.details.${detailIndex}.followInfos.${rule}`}
      render={({ field }) => {
        const value = usefulYears
          ? getUsefulLifeFromRate(field.value)
          : field.value;
        const input = (
          <Input
            type="number"
            aria-label={fieldLabel}
            min={usefulYears ? 1 : 0}
            max={
              (rule === 'annualDepreciationRate' ||
                rule === 'taxAnnualDepreciationRate') &&
              !usefulYears
                ? 100
                : undefined
            }
            step="any"
            value={value ?? ''}
            onChange={(event) => {
              const entered = event.target.value;
              let nextValue: number | undefined;
              if (entered !== '') {
                nextValue = usefulYears
                  ? getRateFromUsefulLife(Number(entered))
                  : Number(entered);
              }
              field.onChange(nextValue);
              if (
                (nextValue || 0) > 0 &&
                (rule === 'revaluationLoss' || rule === 'revaluationReserve')
              ) {
                const opposite =
                  rule === 'revaluationLoss'
                    ? 'revaluationReserve'
                    : 'revaluationLoss';
                form.setValue(
                  `trDocs.${index}.details.${detailIndex}.followInfos.${opposite}`,
                  0,
                  { shouldDirty: true, shouldValidate: true },
                );
              }
            }}
          />
        );
        return (
          <Form.Item className={compact ? 'min-w-0' : 'min-w-32'}>
            {!compact && <Form.Label>{fieldLabel}</Form.Label>}
            {compact ? (
              <PopoverScoped
                scope={`trDocs.${index}.details.${detailIndex}.followInfos.${rule}`}
                closeOnEnter
              >
                <Form.Control>
                  <RecordTableInlineCell.Trigger aria-label={fieldLabel}>
                    {value?.toLocaleString() ?? '-'}
                  </RecordTableInlineCell.Trigger>
                </Form.Control>
                <RecordTableInlineCell.Content>
                  {input}
                </RecordTableInlineCell.Content>
              </PopoverScoped>
            ) : (
              <Form.Control>{input}</Form.Control>
            )}
            <Form.Message />
          </Form.Item>
        );
      }}
    />
  );
};

export const FxaChangeLifeFields = ({
  tax = false,
  className = 'grid grid-cols-2 gap-3',
  ...props
}: IFxaChangeFieldProps & { tax?: boolean; className?: string }) => (
  <div className={className}>
    <FxaChangeNumberField
      {...props}
      rule={tax ? 'taxAnnualDepreciationRate' : 'annualDepreciationRate'}
      label={tax ? 'tax-useful-life-in-years' : 'useful-life-in-years'}
      usefulYears
    />
    <FxaChangeNumberField
      {...props}
      rule={tax ? 'taxAnnualDepreciationRate' : 'annualDepreciationRate'}
      label={tax ? 'annual-tax-depreciation-rate' : 'annual-depreciation-rate'}
    />
  </div>
);

export const FxaChangeMethodField = ({
  form,
  index,
  detailIndex,
  capital,
  tax = false,
  income = false,
}: IFxaChangeFieldProps & {
  capital: boolean;
  tax?: boolean;
  income?: boolean;
}) => {
  const { t } = useTranslation('accounting');
  return (
    <Form.Field
      control={form.control}
      name={`trDocs.${index}.details.${detailIndex}.followInfos.${
        tax ? 'taxDepreciationMethod' : 'depreciationMethod'
      }`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            {t(tax ? 'tax-depreciation-method' : 'depreciation-method')}
          </Form.Label>
          <Select
            value={field.value || (capital ? 'straightLine' : 'unchanged')}
            onValueChange={(value) =>
              field.onChange(value === 'unchanged' ? undefined : value)
            }
          >
            <Form.Control>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
            </Form.Control>
            <Select.Content>
              {!capital && (
                <Select.Item value="unchanged">
                  {t('fxa-keep-current')}
                </Select.Item>
              )}
              {FIXED_ASSET_DEPRECIATION_METHODS.filter(
                (method) => income || method.value !== 'manual',
              ).map((method) => (
                <Select.Item key={method.value} value={method.value}>
                  {t(method.label)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
