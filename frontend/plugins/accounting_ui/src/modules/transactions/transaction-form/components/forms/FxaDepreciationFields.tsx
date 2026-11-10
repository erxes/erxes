import { useId } from 'react';
import { Form, Input, InputNumber, Label } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IFxaChangeFieldProps } from '@/transactions/transaction-form/components/forms/FxaChangeFields';
import { TFxaCapitalValuation } from '@/transactions/transaction-form/components/forms/hooks/fxaCapitalPreview';
import {
  allocateFxaDepreciation,
  getTotalFxaDepreciation,
} from '@/transactions/transaction-form/components/helpers/fxaDepreciation';

export const FxaDepreciationFields = ({
  form,
  index,
  detailIndex,
  valuation,
}: IFxaChangeFieldProps & { valuation?: TFxaCapitalValuation }) => {
  const { t } = useTranslation('accounting');
  const fieldId = useId();
  const details = useWatch({
    control: form.control,
    name: `trDocs.${index}.details`,
  });
  const detail = details[detailIndex];
  const group = valuation
    ? details.filter((row) => row.fixedAssetId === detail.fixedAssetId)
    : [detail];
  const count = valuation?.count ?? detail.count ?? 0;
  const total =
    getTotalFxaDepreciation(group) ?? valuation?.preDeprecation ?? 0;
  const unitPreDeprecation = count ? total / count : 0;
  const totalLabel = `${t('total-amount')} ${t(
    'prior-accumulated-depreciation',
  )}`;
  const setTotal = (value: number) => {
    const counts = group.map(
      (row) =>
        valuation?.locations.find(
          (location) =>
            location.branchId === (row.branchId || '') &&
            location.departmentId === (row.departmentId || ''),
        )?.count ??
        row.count ??
        0,
    );
    const amounts = allocateFxaDepreciation(value, counts);
    let groupIndex = 0;
    details.forEach((row, rowIndex) => {
      if (!group.includes(row)) return;
      const amount = amounts[groupIndex++];
      if (row.followInfos?.preDeprecation === amount) return;
      form.setValue(
        `trDocs.${index}.details.${rowIndex}.followInfos.preDeprecation`,
        amount,
        { shouldDirty: true, shouldValidate: true },
      );
    });
  };
  return (
    <>
      <Form.Item>
        <Label htmlFor={`${fieldId}-unit-depreciation`}>
          {t('fxa-new-unit-depreciation')}
        </Label>
        <Input
          type="number"
          step="any"
          id={`${fieldId}-unit-depreciation`}
          value={unitPreDeprecation}
          disabled={count <= 0}
          min={0}
          aria-label={t('fxa-new-unit-depreciation')}
          onChange={(event) => setTotal(Number(event.target.value) * count)}
        />
      </Form.Item>
      <Form.Field
        control={form.control}
        name={`trDocs.${index}.details.${detailIndex}.followInfos.preDeprecation`}
        render={() => (
          <Form.Item>
            <Form.Label>{totalLabel}</Form.Label>
            <Form.Control>
              <InputNumber
                value={total}
                min={0}
                aria-label={totalLabel}
                onChange={(value) => setTotal(value || 0)}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};
