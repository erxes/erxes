import { COMPANY_INFO } from '@erxes/ui-contacts/src/companies/constants';
import { CUSTOMER_BASIC_INFO } from '@erxes/ui-contacts/src/customers/constants';
import { FIELDS_GROUPS_CONTENT_TYPES } from '@erxes/ui-forms/src/settings/properties/constants';
import { IField } from '@erxes/ui/src/types';
import { PRODUCT_INFO } from '@erxes/ui-products/src/constants';
import { __ } from '@erxes/ui/src/utils';

const generateFields = (infos: any[], type: string) => {
  const fields: IField[] = [];

  infos.forEach((info, index) => {
    fields.push({
      _id: `customerBasicInfos${index}`,
      contentType: type,
      type: 'input',
      text: info.label,
      isVisible: true,
      validation: '',
      order: `${index - 1}`,
      options: [],
      groupId: `basicInfosGroup${type}`,
      description: info.label,
      isDefinedByErxes: true
    });
  });

  return fields;
};

const generateGroup = (infos: any[], type: string) => {
  return {
    _id: `basicInfosGroup${type}`,
    name: __('Basic information'),
    description: __(`Basic information of a ${type}`),
    contentType: type,
    order: -1,
    isVisible: true,
    lastUpdatedUser: {
      _id: '123',
      role: 'SYSTEM',
      username: 'system',
      email: 'system@erxes.io',
      details: {
        fullName: 'SYSTEM'
      }
    },
    lastUpdatedUserId: '123',
    isDefinedByErxes: true,
    fields: generateFields(infos, type)
  };
};

const customerBasicInfos = generateGroup(
  CUSTOMER_BASIC_INFO.ALL,
  FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER
);
const companyBasicInfos = generateGroup(
  COMPANY_INFO.ALL,
  FIELDS_GROUPS_CONTENT_TYPES.COMPANY
);

const productBasicInfos = generateGroup(
  PRODUCT_INFO.ALL,
  FIELDS_GROUPS_CONTENT_TYPES.PRODUCT
);

export { customerBasicInfos, companyBasicInfos, productBasicInfos };
