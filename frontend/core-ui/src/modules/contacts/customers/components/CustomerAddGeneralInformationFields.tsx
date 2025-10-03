import { UseFormReturn } from 'react-hook-form';

import { CustomerFormType } from '@/contacts/customers/constants/formSchema';
import {
  AvatarField,
  CodeField,
  DescriptionField,
  EmailValidationStatusField,
  FirstNameField,
  IsSubscribedField,
  LastNameField,
  OwnerIdField,
  PhoneValidationStatusField,
  PrimaryEmailField,
  PrimaryPhoneField,
} from '@/contacts/customers/components/CustomerFormFields';

export const CustomerAddGeneralInformationFields = ({
  form,
}: {
  form: UseFormReturn<CustomerFormType>;
}) => {
  return (
    <>
      <AvatarField control={form.control} />
      <div className="grid grid-cols-2 gap-4 py-4">
        <FirstNameField control={form.control} />
        <LastNameField control={form.control} />
        <CodeField control={form.control} />
        <OwnerIdField control={form.control} />
        <PrimaryEmailField control={form.control} />
        <EmailValidationStatusField control={form.control} />
        <PrimaryPhoneField control={form.control} />
        <PhoneValidationStatusField control={form.control} />
      </div>
      <DescriptionField control={form.control} />
      <IsSubscribedField control={form.control} />
    </>
  );
};
