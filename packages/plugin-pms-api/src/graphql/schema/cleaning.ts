export const types = `
  type Cleaning {
    _id: String!
    roomId: String
    status: String
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
`;

export const mutations = `
  pmsCleaningUpdate(_id:String, ${params}): Cleaning
  pmsCleaningCreate( ${params}):Cleaning
  pmsCleaningRemove(ids:[String]):JSON
`;
