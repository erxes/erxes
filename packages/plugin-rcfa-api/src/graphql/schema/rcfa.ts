export const types = `

  extend type Ticket @key(fields: "_id") {
    _id: String! @external
  }

  extend type Task @key(fields: "_id") {
    _id: String! @external
  }

  type RCFAType {
    _id: String
    mainType: String
    mainTypeId: String
    mainTypeDetail:Ticket,
    relType: String
    relTypeId: String
    relTypeDetail:Task
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
  checkRCFA(rcfaId:String,types:[String],stageIds:[String]):Boolean
`;

export const mutations = `
  setRCFALabels(mainType:String,mainTypeId:String,labelIds:[String]):RCFAType
`;
