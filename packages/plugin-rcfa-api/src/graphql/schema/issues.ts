export const types = `

  type RCFAIssue {
    _id:String,
    rcfaId:String,
    issue:String,
    parentId:String,
    createdAt:Date,
    status:String,
    relType:String,
    relTypeId:String,
    description:String,
    isRootCause:Boolean
  }

`;

export const queries = `
  rcfaIssues(mainType:String, mainTypeId:String): [RCFAIssue]
`;

export const mutations = `
  addRcfaIssue(issue:String, parentId:String, mainType:String, mainTypeId:String):RCFAIssue
  editRcfaIssue(_id:String, doc:JSON):RCFAIssue
  deleteRcfaIssue(_id:String):RCFAIssue
  closeRcfaRoot(_id:String):JSON,
  createActionRcfaRoot(issueId:String,name:String):JSON
`;
