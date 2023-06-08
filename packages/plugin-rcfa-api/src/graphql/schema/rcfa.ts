export const types = `
  type RCFAType {
    _id: String
    mainType: String
    mainTypeId: String
    relType: String
    relTypeId: String
    status: String
    createdAt: Date
    userId: String
    closedAt: Date

    issues:[RCFAIssue]
  }

  type rcfaListQueryResponse {
    list: [RCFAType]
    totalCount: Int
  }
`;

export const queries = `
  rcfaList(perPage:Int, page:Int, searchValue:String, mainType:String, createdAtFrom:String, createdAtTo:String, closedAtFrom:String, closedAtTo:String, status:String): rcfaListQueryResponse
  rcfaDetail(_id:String, mainType:String, mainTypeId:String): RCFAType
`;

const commonMutationParams = `
  mainType:String,
  mainTypeId:String,
  destinationType:String,
  destinationStageId:String,
  issueId:String,
`;

export const mutations = `
  resolveRCFA(${commonMutationParams}):RCFAType
`;
