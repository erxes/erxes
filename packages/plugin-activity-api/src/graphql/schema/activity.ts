export const types = () => `
  type Activity {
    _id: String!
    name: String
    createdAt:Date
    expiryDate:Date
    checked:Boolean
    typeId: String
  
    currentType: ActivityType
  }

  type ActivityType {
    _id: String!
    name: String
  }
`;

export const queries = `
  activities(typeId: String): [Activity]
  activityTypes: [ActivityType]
  activitiesTotalCount: Int
`;

const params = `
  name: String,
  expiryDate: Date,
  checked: Boolean,
  typeId:String
`;

export const mutations = `
  activitiesAdd(${params}): Activity
  activitiesRemove(_id: String!): JSON
  activitiesEdit(_id:String!, ${params}): Activity
  activityTypesAdd(name:String):ActivityType
  activityTypesRemove(_id: String!):JSON
  activityTypesEdit(_id: String!, name:String): ActivityType
`;
