export const types = `
 type Goal @key(fields: "_id") @cacheControl(maxAge: 3) {
_id: String!
 entity: String
 stageId:String
 pipelineId:String
 boardId:String
 contributionType: String
 frequency:String
 metric:String
  goalType: String
  contribution: [String]
  department:String
  unit:String
  branch:String
  progress:JSON
  specificPeriodGoals:JSON
  startDate: String
  endDate: String
  target:String
 },
  type GoalType {
  _id: String!
   entity: String
   stageId:String
   pipelineId:String
   boardId:String
  contributionType: String
  frequency:String
  metric:String
  goalType: String
  contribution: [String]
  department:String
  unit:String
  branch:String
  specificPeriodGoals:JSON
   progress:JSON

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
  branch:String
  department:String
  unit:String
  date:String
  contribution: [String]
  ids: [String]
  searchValue: String
  sortField: String
  sortDirection: Int
`;

export const queries = `
  goals(entity:String, contributionType:String,frequency:String,metric:String,goalType:String, contribution: [String],specificPeriodGoals:JSON stageId:String,pipelineId:String,boardId:String,
  department:String,unit:String,branch:String,
  startDate: String, progress:JSON
  endDate: String,target:String): [Goal]
  goalDetail(_id: String!): JSON
  goalTypesMain(${queryParams}): GoalTypesListResponse
  goalTypeMainProgress: JSON
  goalTypes(${queryParams}): [GoalType]
`;

const params = `
  entity: String
  stageId: String
  pipelineId: String
  boardId: String
  contributionType: String
  frequency: String
  metric: String
  goalType: String
  contribution: [String]
  department:String
  unit:String
  branch:String
  specificPeriodGoals:JSON
  progress:JSON
  startDate:String
  endDate:String
  target: String
`;

export const mutations = `
  goalsAdd(${params}): Goal
  goalsEdit(_id: String!, ${params}): Goal
  goalsRemove(goalTypeIds: [String]): [String]
`;
