import { useTranslation } from 'react-i18next';
import { getFxaTaxLabel } from '@/adjustments/fxa/utils/fxaTaxLabels';
import {
  FxaChangeLifeFields,
  FxaChangeMethodField,
  FxaChangeNumberField,
  type IFxaChangeFieldProps,
} from '@/transactions/transaction-form/components/forms/FxaChangeFields';
import { FxaDepreciationFields } from '@/transactions/transaction-form/components/forms/FxaDepreciationFields';
import type { TFxaCapitalValuation } from '@/transactions/transaction-form/components/forms/hooks/fxaCapitalPreview';

export const FxaChangeDepreciationFields = ({
  valuation,
  tax = false,
  ...props
}: IFxaChangeFieldProps & {
  valuation?: TFxaCapitalValuation;
  tax?: boolean;
}) => {
  const { t } = useTranslation('accounting');
  return (
    <div className="col-span-full space-y-4">
      <h4 className="font-medium">
        {getFxaTaxLabel(
          t,
          tax ? 'tax-depreciation-rules' : 'business-depreciation-rules',
        )}
      </h4>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FxaChangeMethodField
          {...props}
          capital
          tax={tax}
          fallbackValue={
            (tax
              ? valuation?.taxDepreciationMethod
              : valuation?.depreciationMethod) ?? undefined
          }
        />
        <FxaChangeLifeFields
          {...props}
          tax={tax}
          className="contents"
          fallbackRate={
            (tax
              ? valuation?.taxAnnualDepreciationRate
              : valuation?.annualDepreciationRate) ?? undefined
          }
        />
        <FxaChangeNumberField
          {...props}
          rule={tax ? 'taxSalvageValue' : 'salvageValue'}
          label={tax ? 'tax-residual-value' : 'fxa-unit-salvage-value'}
          fallbackValue={
            (tax ? valuation?.taxSalvageValue : valuation?.salvageValue) ??
            undefined
          }
        />
        <FxaDepreciationFields
          {...props}
          valuation={valuation}
          tax={tax}
          labels={
            tax
              ? undefined
              : {
                  unit: getFxaTaxLabel(t, 'unit-accumulated-depreciation'),
                  total: getFxaTaxLabel(t, 'total-accumulated-depreciation'),
                }
          }
        />
      </div>
    </div>
  );
};
