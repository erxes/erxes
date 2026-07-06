import { SelectCustomer, SelectCompany, SelectMember } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { SelectClientPortalUserFormItem } from './SelectOwnerById';

type Props = {
  ownerType: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
};

export const SelectOwnerByType = ({
  ownerType,
  value,
  onValueChange,
  placeholder,
}: Props) => {
  const { t } = useTranslation('loyalty');
  const PLACEHOLDERS: Record<string, string> = {
    customer: t('choose-customer'),
    company: t('choose-company'),
    user: t('choose-team-member'),
    cpUser: t('choose-client-portal-user'),
  };
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
