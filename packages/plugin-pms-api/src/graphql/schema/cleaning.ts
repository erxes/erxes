export const types = `
  enum ROOM_STATUS {
    clean
    cleaning
    dirty
    serving
    blocked
    repair
  }

  type Cleaning {
    _id: String!
    roomId: String
    status: ROOM_STATUS
  }

  type CleaningHistory {
    _id: String!
    roomId: String
    status: ROOM_STATUS
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
  pmsCleaningUpdateBulk(roomIds:[String],status: ROOM_STATUS, who: String ): JSON
`;
