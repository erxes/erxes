export const types = `
  type Cleaning {
    _id: String!
    roomId: String
    status: String
  }
type CleaningHistory {
    _id: String!
    roomId: String
    status: String
    statusPrev:String
    who: String
    date: Date
  }
`;
// input PmsConfigInput {
//   pipelineId: String!
//   code: String!
//   value: String!
// }
const params = `
   roomId:String,
   status:String,
   date: Date
`;
export const queries = `
  pmsCleanings: [Cleaning]
  pmsCleaningsHistory(roomIds:[String]):[CleaningHistory]
`;

export const mutations = `
  pmsCleaningUpdateBulk(roomIds:[String],status:String, who: String ): JSON
`;
