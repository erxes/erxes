import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';

export const useEarnRowConditionsSummary = (
  form: UseFormReturn<LoyaltyScoreFormValues>,
  index: number,
) => {
  const { t } = useTranslation('loyalty');
  const conditions = useWatch({
    control: form.control,
    name: `add.table.rows.${index}.conditions`,
  });

  const parts = [
    conditions?.minAmount &&
      `≥ ${Number(conditions.minAmount).toLocaleString()}`,
    conditions?.maxAmount &&
      `≤ ${Number(conditions.maxAmount).toLocaleString()}`,
    conditions?.firstPurchase && t('earn-first-purchase'),
    (conditions?.productCategoryIds?.length ||
      conditions?.productIds?.length ||
      conditions?.tagIds?.length) &&
      t('earn-products'),
    conditions?.sources?.length &&
      conditions.sources.map((source) => t(`earn-source-${source}`)).join(', '),
  ].filter(Boolean);

  return parts.length ? parts.join(' · ') : t('earn-no-conditions');
};
