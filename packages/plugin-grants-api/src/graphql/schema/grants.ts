import { paginateParams } from '../../common/graphql';

export const types = `

  type ContentDetail  {
    _id:String,
    name:String,
  }

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
    detail:ContentDetail,
    
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
  closedAtTo:String
`;

export const queries = `
  grantRequest(contentType:String,contentTypeId:String):GrantRequest
  grantRequestDetail(_id:String):GrantRequest
  grantRequests(${commonParams}):[GrantRequest]
  grantRequestsTotalCount(${commonParams}):Int
  getGrantRequestActions:[GrantAction]
`;

const commonRequestMutationParams = `
  contentType:String,
  contentTypeId:String,
  userIds:[String],
  action:String,
  params:String,
  scope:String
`;

export const mutations = `
    addGrantRequest(${commonRequestMutationParams}):JSON
    editGrantRequest(${commonRequestMutationParams}):JSON
    responseGrantRequest( description:String, response:String, requestId:String):JSON
    cancelGrantRequest(contentType:String,contentTypeId:String):JSON
`;
