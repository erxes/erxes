import { FormInput } from './FormInput';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

interface VatSectionProps<T extends FieldValues> {
  control: Control<T>;
  hasVat: boolean;
}

export const VatSection = <T extends FieldValues>({
  control,
  hasVat,
}: VatSectionProps<T>) => {
  if (!hasVat) return null;

  return (
    <>
      <FormInput
        name={'vatPercent' as FieldPath<T>}
        label="Vat percent"
        placeholder="Enter vat percent"
        control={control}
        type="number"
      />
      <FormInput
        name={'vatPayableAccount' as FieldPath<T>}
        label="Vat Payable Account"
        placeholder="Vat Payable Account"
        control={control}
      />
    </>
  );
};
