export const types = `

  type RCFAIssue {
    _id:String,
    rcfaId:String,
    issue:String,
    parentId:String,
    createdAt:Date,
    status:String,
    taskIds:[String],
    actionIds:[String],
    description:String,
    isRootCause:Boolean
  }

`;

export const queries = `
  rcfaIssues(mainType:String, mainTypeId:String): [RCFAIssue]
`;

const createActionMutationParams = `
  mainType:String,
  mainTypeId:String,
  destinationType:String,
  destinationStageId:String,
  issueId:String,
  name:String
`;

export const mutations = `
  addRcfaIssue(issue:String, parentId:String, mainType:String, mainTypeId:String):RCFAIssue
  editRcfaIssue(_id:String, doc:JSON):RCFAIssue
  deleteRcfaIssue(_id:String):RCFAIssue
  closeRcfaRoot(_id:String):JSON,
  createTaskRcfaRoot(issueId:String,name:String,stageId:String):JSON
  createActionRcfaRoot(${createActionMutationParams}):JSON
`;
