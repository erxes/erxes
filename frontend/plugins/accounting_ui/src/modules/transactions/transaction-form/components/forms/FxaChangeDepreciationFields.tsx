import { useTranslation } from 'react-i18next';
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
  revaluation = false,
  ...props
}: IFxaChangeFieldProps & {
  valuation?: TFxaCapitalValuation;
  tax?: boolean;
  revaluation?: boolean;
}) => {
  const { t } = useTranslation('accounting');
  return (
    <div className="col-span-full space-y-4">
      <h4 className="font-medium">
        {t(tax ? 'tax-depreciation-rules' : 'business-depreciation-rules')}
      </h4>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {!revaluation && (
          <>
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
          </>
        )}
        <FxaDepreciationFields
          {...props}
          valuation={valuation}
          tax={tax}
          revaluation={revaluation}
          labels={
            tax
              ? undefined
              : {
                  unit: t('unit-accumulated-depreciation'),
                  total: t('total-accumulated-depreciation'),
                }
          }
        />
      </div>
    </div>
  );
};
