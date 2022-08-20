import { attachmentType } from '@erxes/api-utils/src/commonTypeDefs';

export const types = ({ cardsEnabled, formsEnabled }) => {
  return `
    ${attachmentType}

    type DealRP {
      _id: String
      name: String
      products: JSON
      customFieldsData: JSON
      assignedUsers: JSON
      stage: JSON
      description: String
      attachments: [Attachment]
    }

    type DealsForRentpayResponse {
      list: [DealRP]
      totalCount: Int
    }

    ${
      formsEnabled
        ? `extend type Field @key(fields: "_id") {
        _id: String! @external
        }`
        : ''
    }
  `;
};

const listQueryParams = `
    searchValue: String
    ids: [String]
    customerIds: [String]
    buyerIds: [String]
    waiterIds: [String]
    priceRange: String
    district: String
    customFields: JSON
    stageCode: String
    stageChangedDate: Date
    limit: Int
    skip: Int
 `;

export const queries = ({ formsEnabled, cardsEnabled }) => `
 dealsForRentpay(${listQueryParams}): DealsForRentpayResponse
 fieldsForRentpay(contentType: String!, code: String, searchable: Boolean): ${
   formsEnabled ? '[Field]' : 'JSON'
 }
 dealDetailForRentpay(_id: String!): ${cardsEnabled ? 'DealRP' : 'JSON'}
`;

export const mutations = `
  modifyWaiterCustomerList(dealId: String, customerId: String, type: String): [String]
  createRentpayCustomer(firstName: String, lastName: String, email: String, phone: String): JSON
  rentPayDealsEditCustomFieldItem(_id: String!, key: String!, value: JSON!): JSON
`;
