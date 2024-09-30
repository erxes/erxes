export const types = `
    type Contacts {
        _id:String,
        fullName:String,
        primaryEmail:String,
        primaryPhone:String,
        avatar:String,
        createdAt:String,
        status:String,
        contentType:String
    }
`;

const queryParams = `
  page: Int,
  perPage: Int,
  searchValue: String,
  fieldsMustExist:[String]
  sortField: String
  sortDirection: String,
  usageType: String
`;

export const queries = `
    contacts(${queryParams}):[Contacts]
`;
