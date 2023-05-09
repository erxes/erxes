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
    users:[User],
    detail:ContentDetail,
    
    responses:[GrantResponse]
  }

  type GrantResponse {
    _id:String,
    userId:String,
    user:User,
    response:String,
    description:String
  }

  type Action  {
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
  status:String
`;

export const queries = `
  grantRequest(contentType:String,contentTypeId:String):GrantRequest
  grantRequestDetail(_id:String):GrantRequest
  grantRequests(${commonParams}):[GrantRequest]
  grantRequestsTotalCount(${commonParams}):Int
  getGrantRequestActions:[Action]
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
