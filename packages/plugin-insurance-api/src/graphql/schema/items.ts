export const types = ({ contacts, clientportal }) => `
type InsuranceItem @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: ID!
    customerID: ID
    companyID: ID
    vendorUserId: ID
    userId: ID
    customFieldsData: JSON
  
    customer: ${contacts ? 'Customer' : 'JSON'}
    company: ${contacts ? 'Company' : 'JSON'}
    vendorUser: ${clientportal ? 'ClientPortalUser' : 'JSON'}
    user: User
    
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
`;

export const mutations = `
    vendorAddInsuranceItem(doc: InsuranceItemInput): InsuranceItem
    vendorEditInsuranceItem(_id: ID!, doc: InsuranceItemInput): InsuranceItem
`;
