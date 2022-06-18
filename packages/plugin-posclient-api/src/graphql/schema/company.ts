export const types = `
  type Company {
    _id: String!

    createdAt: Date
    modifiedAt: Date
    avatar: String

    size: Int
    website: String
    industry: String
    plan: String
    parentCompanyId: String
    ownerId: String
    mergedIds: [String]

    names: [String]
    primaryName: String
    emails: [String]
    primaryEmail: String
    phones: [String]
    primaryPhone: String

    businessType: String
    description: String
    isSubscribed: String
    links: JSON
    owner: User
    parentCompany: Company

    tagIds: [String]

    customFieldsData: JSON
    trackedData: JSON

    customers: [Customer]
    code: String
    location: String
    score: Float
  }
`;
