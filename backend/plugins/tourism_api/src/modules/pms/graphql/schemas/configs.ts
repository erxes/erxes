import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  extend type Product @key(fields: "_id") {
      _id: String! @external
  }
  extend type Deal @key(fields: "_id") {
      _id: String! @external
  }
   
  type PmsConfig {
    pipelineId: String!
    code: String!
    value: String!
  }

  input PmsConfigInput {
    pipelineId: String!
    code: String!
    value: String!
  }
`;

export const queries = `
  pmsConfigs: [PmsConfig]
  pmsConfigsGetValue(code:String): PmsConfig
  pmsRooms(skipStageIds : [String], perPage:Int,page: Int, pipelineId:String! ,endDate1:Date,endDate2:Date, startDate1:Date ,startDate2:Date ): [Deal]
  pmsCheckRooms(skipStageIds : [String],pipelineId:String! ,endDate:Date, startDate:Date,ids:[String]): [Product]
`;

const params = `
   list:[PmsConfigInput]
`;

export const mutations = `
  pmsConfigsUpdate(${params}): [PmsConfig]
  pmsRoomChangeByUser(userId:String!, password:String!):JSON
`;
