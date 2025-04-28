export const types = `
  type CommentsUser @key(fields: "_id") {
       _id: String!
        firstName:String
        middleName:String
        lastName:String
        primaryEmail:String
        primaryPhone:String
        visitorContactInfo:String
  }
`;