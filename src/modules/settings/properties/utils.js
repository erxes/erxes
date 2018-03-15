import { COMPANY_INFO } from 'modules/companies/constants';
import { CUSTOMER_BASIC_INFO } from 'modules/customers/constants';
import { FIELDS_GROUPS_CONTENT_TYPES } from './constants';

const generateFields = (infos, type) => {
  const fields = [];

  Object.keys(infos).forEach((info, index) => {
    fields.push({
      _id: `customerBasicInfos${index}`,
      contentType: type,
      type: 'input',
      text: infos[info],
      isVisible: true,
      validation: '',
      order: `${index - 1}`,
      options: [],
      groupId: `basicInfosGroup${type}`,
      description: infos[info],
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

const generateGroup = (infos, type) => {
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
  CUSTOMER_BASIC_INFO,
  FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER
);
const companyBasicInfos = generateGroup(
  COMPANY_INFO,
  FIELDS_GROUPS_CONTENT_TYPES.COMPANY
);

export { customerBasicInfos, companyBasicInfos };
