export const types = `
  enum TimelyType {
    daily
    weekly
    monthly
    seasonally
  }

  type Uom {
    _id: String!
    name: String
    code: String
    createdAt: Date
    isForSubscription:Boolean
    subscriptionConfig:JSON
    timely: TimelyType
  }
`;

export const queries = `
  uoms: [Uom]
  uomsTotalCount: Int
`;

const mutationParams = `
  name: String,
  code: String,
  isForSubscription:Boolean,
  subscriptionConfig:JSON
  timely: TimelyType
`;

export const mutations = `
  uomsAdd(${mutationParams}): Uom
  uomsEdit(_id: String!, ${mutationParams}): Uom
  uomsRemove(uomIds: [String!]): String
`;
