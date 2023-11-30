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
    customFieldsData: JSON
  
    customer: ${contacts ? 'Customer' : 'JSON'}
    company: ${contacts ? 'Company' : 'JSON'}
    vendorUser: ${clientportal ? 'ClientPortalUser' : 'JSON'}
    user: User
    
    dealId: ID
    deal: Deal

    productId: ID

    product: InsuranceProduct
  }
  
  input InsuranceItemInput {
    customerId: ID
    companyId: ID
    productId: ID!
    customFieldsData: JSON


  }
  
  type InsuranceItemListResult {
    list: [InsuranceItem]
    totalCount: Int
  }
    
`;

export const queries = `
    insuranceItems: [InsuranceItem]
    insuranceItemList: InsuranceItemListResult
    insuranceItem(_id: ID!): InsuranceItem

    vendorInsuranceItems(   page: Int
      perPage: Int
      sortField: String
      sortDirection: SortDirection
      searchValue: String): InsuranceItemListResult
`;

export const mutations = `
    vendorAddInsuranceItem(doc: InsuranceItemInput): InsuranceItem
    vendorEditInsuranceItem(_id: ID!, doc: InsuranceItemInput): InsuranceItem
`;
