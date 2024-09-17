export const types = `
 type Goal @key(fields: "_id") @cacheControl(maxAge: 3) {
_id: String!
 name: String
 entity: String
 stageId:String
 pipelineId:String
 boardId:String
 contributionType: String
 segmentIds: [String]
 periodGoal:String
 teamGoalType:String
 stageRadio:Boolean
 structure:String
segmentRadio:Boolean
 metric:String
  goalTypeChoose: String
  contribution: [String]
  department:[String]
  unit:[String]
  branch:[String]
  specificPeriodGoals:JSON
  startDate: Date
  endDate: Date
  segmentCount:Float
  pipelineLabels:JSON
  productIds:[String]
  companyIds:[String]
  tagsIds:[String]
 },
  type GoalType {
  _id: String!
   name: String
   entity: String
   stageId:String
   pipelineId:String
   boardId:String
  contributionType: String
  segmentIds: [String]
  stageRadio:Boolean
  segmentRadio:Boolean
  periodGoal:String
  teamGoalType:String
  metric:String
  goalTypeChoose: String
  contribution: [String]
  department:[String]
  unit:[String]
  branch:[String]
  specificPeriodGoals:JSON
  startDate: Date
  endDate: Date
  segmentCount:Float
  pipelineLabels:JSON
  productIds:[String]
  companyIds:[String]
  tagsIds:[String]
  },
    type GoalTypesListResponse {
    list: [GoalType],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  branch:[String]
  department:[String]
  unit:[String]
  date:Date
  endDate:Date
  contribution: [String]
  segmentIds: [String]
  ids: [String]
  searchValue: String
  sortField: String
  sortDirection: Int
`;

export const queries = `
  goals(entity:String, name: String, contributionType:String,metric:String,  segmentIds: [String],goalTypeChoose:String, contribution: [String],specificPeriodGoals:JSON stageId:String,pipelineId:String,boardId:String, periodGoal:String
   stageRadio:Boolean, segmentRadio:Boolean, periodGoal:String, teamGoalType:String,
  department:[String],unit:[String],branch:[String],
  startDate: Date, segmentCount:Float,
  pipelineLabels:JSON,
  productIds:[String],
  companyIds:[String],
  tagsIds:[String],
  endDate: Date): [Goal]
  goalDetail(_id: String!): JSON
  goalTypesMain(${queryParams}): GoalTypesListResponse
  goalTypes(${queryParams}): [GoalType]
`;

const params = `
  name: String
  entity: String
  stageId: String
  pipelineId: String
  boardId: String
  contributionType: String
  metric: String
  goalTypeChoose: String
  contribution: [String]
  department:[String]
  unit:[String]
  branch:[String]
  specificPeriodGoals:JSON
  startDate:Date
  endDate:Date
  segmentCount: Float
  pipelineLabels:JSON
  productIds:[String]
  companyIds:[String]
  tagsIds:[String]
  segmentIds: [String]
  periodGoal:String
  segmentRadio:Boolean
  stageRadio:Boolean
  periodGoal:String
  teamGoalType:String
`;

export const mutations = `
  goalsAdd(${params}): Goal
  goalsEdit(_id: String!, ${params}): Goal
  goalsRemove(goalTypeIds: [String]): [String]
`;
