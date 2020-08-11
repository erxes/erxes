import { COMPANY_INFO } from 'modules/companies/constants';
import { CUSTOMER_BASIC_INFO } from 'modules/customers/constants';
import { PRODUCT_INFO } from '../productService/constants';
import { FIELDS_GROUPS_CONTENT_TYPES } from './constants';
import { IField } from './types';

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
    name: 'Basic information',
    description: `Basic information of a ${type}`,
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
