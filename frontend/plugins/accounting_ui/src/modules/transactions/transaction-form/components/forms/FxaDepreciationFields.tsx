import { ITrDetail } from '@/transactions/types/Transaction';
import { useId } from 'react';
import { Form, Input, InputNumber, Label } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IFxaChangeFieldProps } from '@/transactions/transaction-form/components/forms/FxaChangeFields';
import { TFxaCapitalValuation } from '@/transactions/transaction-form/components/forms/hooks/fxaCapitalPreview';
import {
  allocateFxaDepreciation,
  getTotalFxaDepreciation,
  getFxaRevaluationTaxTotal,
} from '@/transactions/transaction-form/components/helpers/fxaDepreciation';

export const FxaDepreciationFields = ({
  form,
  index,
  detailIndex,
  valuation,
  tax = false,
  revaluation = false,
  labels,
  showUnit = true,
}: IFxaChangeFieldProps & {
  valuation?: TFxaCapitalValuation;
  tax?: boolean;
  revaluation?: boolean;
  labels?: { unit: string; total: string };
  showUnit?: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const fieldId = useId();
  const details: ITrDetail[] = useWatch({
    control: form.control,
    name: `trDocs.${index}.details`,
  });
  const detail = details[detailIndex];
  const group = valuation
    ? details.filter((row) => row.fixedAssetId === detail.fixedAssetId)
    : [detail];
  const count = valuation?.count ?? detail.count ?? 0;
  const rule = tax ? 'taxPreDeprecation' : 'preDeprecation';
  const storedTotal =
    getTotalFxaDepreciation(group, rule) ??
    (tax ? valuation?.taxPreDeprecation : valuation?.preDeprecation) ??
    0;
  const total =
    revaluation && tax && valuation
      ? getFxaRevaluationTaxTotal(
          getTotalFxaDepreciation(group) ?? valuation.preDeprecation,
          valuation.preDeprecation,
          valuation.taxPreDeprecation,
        )
      : storedTotal;
  const unitPreDeprecation = count ? total / count : 0;
  const unitLabel =
    labels?.unit ??
    (tax
      ? t('tax-unit-accumulated-depreciation')
      : t('fxa-new-unit-depreciation'));
  const totalLabel =
    labels?.total ??
    (tax
      ? t('tax-total-accumulated-depreciation')
      : `${t('total-amount')} ${t('prior-accumulated-depreciation')}`);
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
    const taxAmounts =
      revaluation && !tax && valuation
        ? allocateFxaDepreciation(
            getFxaRevaluationTaxTotal(
              value,
              valuation.preDeprecation,
              valuation.taxPreDeprecation,
            ),
            counts,
          )
        : undefined;
    let groupIndex = 0;
    details.forEach((row, rowIndex) => {
      if (!group.includes(row)) return;
      const amount = amounts[groupIndex];
      if (taxAmounts)
        form.setValue(
          `trDocs.${index}.details.${rowIndex}.followInfos.taxPreDeprecation`,
          taxAmounts[groupIndex],
          { shouldDirty: true, shouldValidate: true },
        );
      groupIndex++;
      if (row.followInfos?.[rule] === amount) return;
      form.setValue(
        `trDocs.${index}.details.${rowIndex}.followInfos.${rule}`,
        amount,
        { shouldDirty: true, shouldValidate: true },
      );
    });
  };
  return (
    <>
      {showUnit && (
        <Form.Item>
          <Label htmlFor={`${fieldId}-unit-depreciation`}>{unitLabel}</Label>
          <Input
            type="number"
            step="any"
            id={`${fieldId}-unit-depreciation`}
            value={unitPreDeprecation}
            disabled={count <= 0 || (revaluation && tax)}
            min={0}
            aria-label={unitLabel}
            onChange={(event) => setTotal(Number(event.target.value) * count)}
          />
        </Form.Item>
      )}
      <Form.Field
        control={form.control}
        name={`trDocs.${index}.details.${detailIndex}.followInfos.${rule}`}
        render={() => (
          <Form.Item>
            <Form.Label>{totalLabel}</Form.Label>
            <Form.Control>
              <InputNumber
                value={total}
                disabled={revaluation && tax}
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
