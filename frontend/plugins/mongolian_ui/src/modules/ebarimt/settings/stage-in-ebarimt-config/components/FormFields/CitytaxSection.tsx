import { FormInput } from './FormInput';
import { FormSelectEbarimtProductRules } from './FormSelectEbarimtProductRules';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

interface CitytaxSectionProps<T extends FieldValues> {
  control: Control<T>;
  hasAllCitytax: boolean;
}

export const CitytaxSection = <T extends FieldValues>({
  control,
  hasAllCitytax,
}: CitytaxSectionProps<T>) => {
  if (hasAllCitytax) {
    return (
      <>
        <FormInput
          name={'citytaxPercent' as FieldPath<T>}
          label="Citytax Percent"
          placeholder="Enter citytax percent"
          control={control}
          type="number"
        />
        <FormInput
          name={'allCitytaxPayableAccount' as FieldPath<T>}
          label="All Citytax Payable Account"
          placeholder="All Citytax Payable Account"
          control={control}
        />
      </>
    );
  }

  return (
    <FormSelectEbarimtProductRules
      name={'anotherRulesOfProductsOnCitytax' as FieldPath<T>}
      label="Another rules of products on citytax"
      placeholder="Select Citytax rule"
      kind="ctax"
      control={control}
    />
  );
};
