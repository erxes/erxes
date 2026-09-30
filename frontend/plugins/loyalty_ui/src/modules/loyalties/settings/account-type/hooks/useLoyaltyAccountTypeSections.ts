import { FieldErrors, UseFormReturn } from 'react-hook-form';
import { useFormSections } from '../../../hooks/useFormSections';
import { TLoyaltyAccountTypeFormValues } from './useLoyaltyAccountTypeForm';

export type TLoyaltyAccountTypeSection =
  | 'general'
  | 'points'
  | 'tiers'
  | 'expiry';

export const LOYALTY_ACCOUNT_TYPE_SECTIONS: TLoyaltyAccountTypeSection[] = [
  'general',
  'points',
  'tiers',
  'expiry',
];

const SECTION_HAS_ERROR: Record<
  TLoyaltyAccountTypeSection,
  (errors: FieldErrors<TLoyaltyAccountTypeFormValues>) => boolean
> = {
  general: (errors) =>
    !!(errors.name || errors.ownerType || errors.frozenBlocks),
  points: (errors) =>
    !!(errors.currencyRatio || errors.pointValue || errors.pendingDays),
  tiers: (errors) => !!errors.tiers,
  expiry: (errors) => !!(errors.expiry || errors.reset),
};

export const useLoyaltyAccountTypeSections = (
  form: UseFormReturn<TLoyaltyAccountTypeFormValues>,
) => useFormSections(form, LOYALTY_ACCOUNT_TYPE_SECTIONS, SECTION_HAS_ERROR);
