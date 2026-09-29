import { FieldErrors, UseFormReturn } from 'react-hook-form';
import { useFormSections } from '../../../../hooks/useFormSections';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';

export type TScoreCampaignSection =
  | 'general'
  | 'source'
  | 'products'
  | 'automations';

export const SCORE_CAMPAIGN_SECTIONS: TScoreCampaignSection[] = [
  'general',
  'source',
  'products',
  'automations',
];

type TErrors = FieldErrors<LoyaltyScoreFormValues>;

const SECTION_HAS_ERROR: Record<
  TScoreCampaignSection,
  (errors: TErrors) => boolean
> = {
  general: (errors) =>
    !!(
      errors.title ||
      errors.order ||
      errors.description ||
      errors.accountTypeId ||
      errors.add ||
      errors.subtract
    ),
  source: (errors) =>
    !!(errors.conditions?.serviceName || errors.additionalConfig),
  products: (errors) =>
    !!(
      errors.conditions?.productCategoryIds ||
      errors.conditions?.productIds ||
      errors.conditions?.tagIds ||
      errors.conditions?.excludeProductCategoryIds ||
      errors.conditions?.excludeProductIds ||
      errors.conditions?.excludeTagIds
    ),
  automations: () => false,
};

export const useScoreCampaignSections = (
  form: UseFormReturn<LoyaltyScoreFormValues>,
) => useFormSections(form, SCORE_CAMPAIGN_SECTIONS, SECTION_HAS_ERROR);
