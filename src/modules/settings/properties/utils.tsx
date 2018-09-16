import { COMPANY_INFO } from 'modules/companies/constants';
import { CUSTOMER_BASIC_INFO } from 'modules/customers/constants';
import { FIELDS_GROUPS_CONTENT_TYPES } from './constants';

const generateFields = (infos: any[], type: string) => {
  const fields = [];

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
      isDefinedByErxes: true,
      lastUpdatedUser: {
        details: {
          fullName: 'SYSTEM'
        }
      }
    });
  });

  return fields;
};

const generateGroup = (infos: any[], type: string) => {
  return {
    _id: `basicInfosGroup${type}`,
    name: 'Basic Infos',
    description: `Basic Infos of a ${type}`,
    contentType: type,
    order: -1,
    isVisible: true,
    lastUpdatedUser: {
      details: {
        fullName: 'SYSTEM'
      }
    },
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

export { customerBasicInfos, companyBasicInfos };
