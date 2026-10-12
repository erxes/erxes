import { useTranslation } from 'react-i18next';
import { useFields } from 'ui-modules';
import {
  POS_CUSTOMER_PROPERTY_PREFIX,
  POS_CUSTOMER_SYSTEM_FIELDS,
} from '@/pos/components/customerCreate/constants';

export interface ICustomerFormFieldOption {
  code: string;
  name: string;
  isProperty: boolean;
}

const PROPERTY_LIMIT = 100;

// Everything a POS customer form can show: system fields, then customer properties.
export const useCustomerFormFields = () => {
  const { t } = useTranslation('sales');
  const { fields, totalCount, loading } = useFields({
    contentType: 'core:customer',
    limit: PROPERTY_LIMIT,
  });

  const options: ICustomerFormFieldOption[] = [
    ...POS_CUSTOMER_SYSTEM_FIELDS.map(({ code, name }) => ({
      code,
      name: t(code, name),
      isProperty: false,
    })),
    // Featured fields belong to their plugin, which writes their values.
    ...(fields || [])
      .filter((field) => !field.owner)
      .map((field) => ({
        code: `${POS_CUSTOMER_PROPERTY_PREFIX}${field._id}`,
        name: field.name,
        isProperty: true,
      })),
  ];

  // Beyond the first page a placed property cannot be told apart from a deleted one.
  const complete = (fields || []).length >= totalCount;

  return { options, loading, complete };
};
