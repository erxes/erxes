import { Form, Input, Select } from 'erxes-ui';
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
}: IFxaChangeFieldProps & {
  rule:
    | 'originalCost'
    | 'preDeprecation'
    | 'salvageValue'
    | 'annualDepreciationRate';
  label: string;
  compact?: boolean;
  usefulYears?: boolean;
}) => {
  const { t } = useTranslation('accounting');
  return (
    <Form.Field
      control={form.control}
      name={`trDocs.${index}.details.${detailIndex}.followInfos.${rule}`}
      render={({ field }) => (
        <Form.Item className="min-w-32">
          {!compact && <Form.Label>{t(label)}</Form.Label>}
          <Form.Control>
            <Input
              type="number"
              aria-label={t(label)}
              min={usefulYears ? 1 : 0}
              max={
                rule === 'annualDepreciationRate' && !usefulYears
                  ? 100
                  : undefined
              }
              step="any"
              value={
                (usefulYears
                  ? getUsefulLifeFromRate(field.value)
                  : field.value) ?? ''
              }
              onChange={(event) =>
                field.onChange(
                  event.target.value === ''
                    ? undefined
                    : usefulYears
                    ? getRateFromUsefulLife(Number(event.target.value))
                    : Number(event.target.value),
                )
              }
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const FxaChangeMethodField = ({
  form,
  index,
  detailIndex,
  capital,
}: IFxaChangeFieldProps & { capital: boolean }) => {
  const { t } = useTranslation('accounting');
  return (
    <Form.Field
      control={form.control}
      name={`trDocs.${index}.details.${detailIndex}.followInfos.depreciationMethod`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('depreciation-method')}</Form.Label>
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
                (method) => method.value !== 'manual',
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
