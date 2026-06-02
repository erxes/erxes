import { SelectCustomer, SelectCompany, SelectMember } from 'ui-modules';
import { SelectClientPortalUserFormItem } from './SelectOwnerById';

type Props = {
  ownerType: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
};

const PLACEHOLDERS: Record<string, string> = {
  customer: 'Choose customer',
  company: 'Choose company',
  user: 'Choose team member',
  cpUser: 'Choose client portal user',
};

export const SelectOwnerByType = ({
  ownerType,
  value,
  onValueChange,
  placeholder,
}: Props) => {
  const resolvedPlaceholder = placeholder || PLACEHOLDERS[ownerType];
  const handleChange = (val: string | string[] | null) =>
    onValueChange((Array.isArray(val) ? val[0] : val) || '');

  switch (ownerType) {
    case 'customer':
      return (
        <SelectCustomer
          value={value}
          onValueChange={handleChange}
          mode="single"
        />
      );
    case 'company':
      return (
        <SelectCompany
          value={value}
          onValueChange={handleChange}
          mode="single"
        />
      );
    case 'user':
      return (
        <SelectMember.FormItem
          value={value}
          onValueChange={handleChange}
          mode="single"
          placeholder={resolvedPlaceholder}
        />
      );
    case 'cpUser':
      return (
        <SelectClientPortalUserFormItem
          value={value}
          onValueChange={onValueChange}
          placeholder={resolvedPlaceholder}
        />
      );
    default:
      return null;
  }
};
