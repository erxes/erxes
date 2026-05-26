import { SelectScoreCustomerFormItem } from './SelectCustomer';
import {
  SelectCompanyFormItem,
  SelectUserFormItem,
  SelectClientPortalUserFormItem,
} from './SelectOwnerById';

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

  switch (ownerType) {
    case 'customer':
      return (
        <SelectScoreCustomerFormItem
          value={value}
          onValueChange={onValueChange}
          placeholder={resolvedPlaceholder}
        />
      );
    case 'company':
      return (
        <SelectCompanyFormItem
          value={value}
          onValueChange={onValueChange}
          placeholder={resolvedPlaceholder}
        />
      );
    case 'user':
      return (
        <SelectUserFormItem
          value={value}
          onValueChange={onValueChange}
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
