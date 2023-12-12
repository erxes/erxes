export const types = ({ contacts, clientportal }) => `
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
  }
  
  input InsuranceItemInput {
    customerId: ID
    companyId: ID
    productId: ID!
    customFieldsData: JSON
    closeDate: Date
    startDate: Date
    price: Float
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
      page: Int
      perPage: Int
      sortField: String
      sortDirection: SortDirection
      searchField: SearchField
      searchValue: JSON): InsuranceItemListResult
    insuranceItem(_id: ID!): InsuranceItem

    vendorInsuranceItems(  
      page: Int
      perPage: Int
      sortField: String
      sortDirection: SortDirection
      searchField: SearchField
      searchValue: JSON): InsuranceItemListResult
    vendorInsuranceItem(_id: ID!): InsuranceItem
    vendorItemsExport(page: Int
      perPage: Int
      sortField: String
      sortDirection: SortDirection
      searchField: SearchField
      searchValue: JSON): JSON

    vendorInsuranceItemsInfo: JSON
`;

export const mutations = `
    vendorAddInsuranceItem(doc: InsuranceItemInput): InsuranceItem
    vendorEditInsuranceItem(_id: ID!, doc: InsuranceItemInput): InsuranceItem
`;
