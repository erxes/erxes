export const types = `
  type CreatorInfo {
    name: String
    address: String
    email: String
    phone: String
  }

  type Plugin {
    _id: String

    language: String
    createdAt: Date
    modifiedAt: Date
    createdBy: String
    modifiedBy: String

    avatar: String
    images: String
    video: String

    title: String
    creator: CreatorInfo
    department: String

    description: String
    shortDescription: String
    screenShots: String
    features: String

    tango: String

    changeLog: String
    lastUpdatedInfo: String
    contributors: String
    support: String

    mainType: [String]
    selfHosted: Boolean
    type: String
    limit: Int
    count: Int
    initialCount: Int
    growthInitialCount: Int
    resetMonthly: Boolean
    unit: String
    comingSoon: Boolean

    categories: [String]
    dependencies: [String]
    stripeProductId: String

    icon: String
  }
`;

export const queries = `
  savedPlugins(mainType: String): [Plugin]
`;
