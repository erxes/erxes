export const types = `
 type Goal @key(fields: "_id") @cacheControl(maxAge: 3) {
   _id: String!
 entity: String
 contributionType: String
 chooseBoard: String
 frequency:String
 metric:String
  goalType: String
  contribution:String
  startDate: String
  endDate: String
  target:String
 },
  type GoalType {
  _id: String!
   entity: String
  contributionType: String
  chooseBoard: String
  frequency:String
  metric:String
  goalType: String
   contribution:String
  startDate: String
  endDate: String
  target:String
  },
    type GoalTypesListResponse {
    list: [GoalType],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  ids: [String]
  searchValue: String
  sortField: String
  sortDirection: Int
`;

export const queries = `
  goals(entity:String, contributionType:String,chooseBoard:String,frequency:String,metric:String,goalType:String,contribution:String, 
    startDate: String,
  endDate: String,target:String): [Goal]
  goalDetail(_id: String!): Goal
  goalTypesMain(${queryParams}): GoalTypesListResponse
  goalTypes(${queryParams}): [GoalType]
`;

const params = `
  entity: String
  contributionType: String
  chooseBoard: String
  frequency: String
  metric: String
  goalType: String
  contribution: String
  startDate:String
  endDate:String
  target: String
`;

export const mutations = `
  goalsAdd(${params}): Goal
  goalsEdit(_id: String!, ${params}): Goal
  goalsRemove(goalTypeIds: [String]): [String]
`;
