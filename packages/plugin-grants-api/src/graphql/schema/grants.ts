import { paginateParams } from '../../common/graphql';

export const types = `

  type GrantRequest {
    _id:String,
    contentTypeId:String,
    contentType:String,
    action:String,
    params:String,
    requesterId:String,
    requester:User,
    status:String,
    userIds:[String],
    createdAt:Date,
    resolvedAt:Date,
    users:[User],
    detail:JSON,
    
    responses:[GrantResponse]
    actionLabel:String,
  }

  type GrantResponse {
    _id:String,
    userId:String,
    user:User,
    response:String,
    description:String,
    createdAt:Date,
  }

  type GrantAction  {
    label:String,
    action:String,
    scope:String,
    type:String,
  }

  type GrantConfig {
    _id:String,
    name:String,
    scope:String,
    action:String,
    config:String,
    params:String,
    createdAt:Date,
    modifiedAt:Date,
  }

  input ContentFilter {
    name:String,
    value:String,
    regex:Boolean
  }

  input ContentTypeFilter {
    contentType:String,
    filters:[ContentFilter]
  }

`;

const commonParams = `
  ${paginateParams},
  requesterId:String,
  userId:String,
  status:String,
  sortField:String
  sortDirection:Int,
  createdAtFrom:String
  createdAtTo:String
  closedAtFrom:String
  closedAtTo:String,
  onlyWaitingMe:Boolean,
  contentFilter:ContentTypeFilter,
  archived:Boolean
`;

export const queries = `
  grantRequest(contentType:String,contentTypeId:String):GrantRequest
  grantRequestDetail(_id:String):GrantRequest
  grantRequests(${commonParams}):[GrantRequest]
  grantRequestsTotalCount(${commonParams}):Int
  getGrantRequestActions:[GrantAction]
  grantConfigs:[GrantConfig]
  grantConfigsTotalCount:Int
  checkGrantActionConfig(contentType:String,contentTypeId:String,action:String,scope:String):Boolean
`;

const commonRequestMutationParams = `
  contentType:String,
  contentTypeId:String,
  userIds:[String],
  action:String,
  params:String,
  scope:String
`;

const commonConfigMutationParams = `
  name:String,
  scope:String,
  action:String,
  config:String,,
  params:String,
`;

export const mutations = `
    addGrantRequest(${commonRequestMutationParams}):JSON
    editGrantRequest(${commonRequestMutationParams}):JSON
    responseGrantRequest( description:String, response:String, requestId:String):JSON
    cancelGrantRequest(contentType:String,contentTypeId:String):JSON,
    removeGrantRequests(ids:[String]):JSON
    addGrantConfig(${commonConfigMutationParams}):GrantConfig
    editGrantConfig(_id:String,${commonConfigMutationParams}):GrantConfig
    removeGrantConfig(_id:String):JSON
`;
