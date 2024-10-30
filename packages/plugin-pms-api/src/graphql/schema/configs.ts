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
const params = `
   list:[PmsConfigInput]
`;
export const queries = `
  pmsConfigs: [PmsConfig]
  pmsConfigsGetValue(code:String): PmsConfig
  pmsRooms( pipelineId:String! ,endDate1:Date,endDate2:Date, startDate1:Date ,startDate2:Date ): [Deal]
  pmsCheckRooms(pipelineId:String! ,endDate:Date, startDate:Date,ids:[String]): [Product]
`;

export const mutations = `
  pmsConfigsUpdate(${params}): [PmsConfig]
`;
