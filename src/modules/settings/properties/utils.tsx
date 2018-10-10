import { COMPANY_INFO } from 'modules/companies/constants';
import { CUSTOMER_BASIC_INFO } from 'modules/customers/constants';
import { FIELDS_GROUPS_CONTENT_TYPES } from './constants';
import { IField } from './types';

const generateFields = (infos: any[], type: string) => {
  const fields: IField[] = [];

  infos.forEach((info, index) => {
    fields.push({
      _id: `customerBasicInfos${index}`,
      contentType: type,
      description: info.label,
      groupId: `basicInfosGroup${type}`,
      isDefinedByErxes: true,
      isVisible: true,
      options: [],
      order: `${index - 1}`,
      text: info.label,
      type: 'input',
      validation: ''
    });
  });

  return fields;
};

const generateGroup = (infos: any[], type: string) => {
  return {
    _id: `basicInfosGroup${type}`,
    contentType: type,
    description: `Basic Infos of a ${type}`,
    fields: generateFields(infos, type),
    isDefinedByErxes: true,
    isVisible: true,
    lastUpdatedUser: {
      details: {
        fullName: 'SYSTEM'
      }
    },
    name: 'Basic Infos',
    order: -1
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

export { customerBasicInfos, companyBasicInfos };
