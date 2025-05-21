export const types = `
  type CommentsUser @key(fields: "_id") {
       _id: String!

   state: String
    createdAt: Date
    modifiedAt: Date
    avatar: String
    integrationId: String
    firstName: String
    lastName: String
    middleName: String

    birthDate: Date
    sex: Int

    email: String
    primaryEmail: String
    emails: [String]
    primaryPhone: String
    phones: [String]
    primaryAddress: JSON
    addresses: [JSON]

    phone: String
    tagIds: [String]
    remoteAddress: String
    location: JSON
    visitorContactInfo: JSON
    customFieldsData: JSON
    customFieldsDataByFieldCode: JSON
    trackedData: JSON
    ownerId: String
    position: String
    department: String
    leadStatus: String
    hasAuthority: String
    description: String
    isSubscribed: String
    code: String
    emailValidationStatus: String
    phoneValidationStatus: String

    isOnline: Boolean
  }
`;