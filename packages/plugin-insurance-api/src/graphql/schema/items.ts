import {
  attachmentInput,
  attachmentType,
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = ({ contacts, clientportal }) => `

${attachmentType}
${attachmentInput}

extend type Deal @key(fields: "_id") {
  _id: String! @external
}

type InsuranceItem @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: ID!
    customerId: ID
    companyId: ID
    vendorUserId: ID
    userId: ID
    price: Float
    customFieldsData: JSON
  
    customer: ${contacts ? 'Customer' : 'JSON'}
    company: ${contacts ? 'Company' : 'JSON'}
    vendorUser: ${clientportal ? 'ClientPortalUser' : 'JSON'}
    user: User
    
    dealId: ID
    deal: Deal

    productId: ID

    product: InsuranceProduct

    feePercent: Float
    totalFee: Float

    contracts: [JSON]
  }
  
  input InsuranceItemInput {
    customerId: ID
    companyId: ID
    productId: ID!
    customFieldsData: JSON
    closeDate: Date
    startDate: Date
    price: Float
    customerIds: [ID]
  }
  
  type InsuranceItemListResult {
    list: [InsuranceItem]
    totalCount: Int
  }

  enum SearchField {
    dealNumber
    dealCreatedAt
    dealCloseDate
    dealStartDate
    
    customerRegister
    customerFirstName
    customerLastName
  
    itemPrice
    itemFeePercent
    itemTotalFee
  }
    
`;

export const queries = `
    insuranceItems(
      sortField: String
      sortDirection: SortDirection
      searchField: SearchField
      searchValue: JSON): [InsuranceItem]
    insuranceItemList(
      category: ID
      product: ID
      vendor: ID
      page: Int
      perPage: Int
      sortField: String
      sortDirection: SortDirection
      searchField: SearchField
      searchValue: JSON
      startDate: Date
      endDate: Date
      ): InsuranceItemListResult


    insuranceItem(_id: ID!): InsuranceItem
    insuranceItemByDealId(_id: String!): InsuranceItem

    vendorInsuranceItems(  
      page: Int
      perPage: Int
      sortField: String
      sortDirection: SortDirection
      searchField: SearchField
      searchValue: JSON
      startDate: Date
      endDate: Date
      ): InsuranceItemListResult
    vendorInsuranceItem(_id: ID!): InsuranceItem
    vendorItemsExport(page: Int
      perPage: Int
      sortField: String
      sortDirection: SortDirection
      searchField: SearchField
      searchValue: JSON
      categoryId: ID
      ): JSON

    vendorInsuranceItemsInfo(startDate: Date, endDate: Date): JSON
`;

export const mutations = `
    vendorAddInsuranceItem(doc: InsuranceItemInput): String
    vendorEditInsuranceItem(_id: ID!, firstName: String, lastName: String, customFieldsData: JSON ): InsuranceItem
    insuranceItemEdit(_id: ID!, doc: InsuranceItemInput): InsuranceItem
`;
