export const types = `
    type TicketCommentUser @key(fields: "_id") {
    _id: String!
    createdAt: Date
    modifiedAt: Date
    fullName: String
    firstName: String
    lastName: String
    phone: String
    email: String
    username: String
    type: String
    companyName: String
    companyRegistrationNumber: String
    erxesCustomerId: String
    erxesCompanyId: String
    clientPortalId: String
    code: String,
    ownerId: String,
    links: JSON,
    customFieldsData: JSON,
    customFieldsDataByFieldCode: JSON,
    password: String
    isEmailVerified: Boolean
    isPhoneVerified: Boolean

    isOnline: Boolean
    lastSeenAt: Date
    sessionCount: Int



    avatar: String


        customer: Customer
        company: Company

  }
`;
