import { paginateParams } from '../../common/graphql';

export const types = `
  type GrantRequest {
    _id:String,
    action:String,
    params:String,
    requesterId:String,
    status:String,
    userIds:[String],
    users:[User]
  }

  type Action  {
    label:String,
    action:String,
    scope:String,
    type:String,
  }

`;

const commonParams = `
  ${paginateParams}
  status:String
`;

export const queries = `
  grantRequest(cardId:String,cardType:String):GrantRequest
  grantRequests(${commonParams}):[GrantRequest]
  grantRequestsTotalCount(${commonParams}):Int
  getGrantRequestActions:[Action]
`;

const commonRequestMutationParams = `
  cardId:String,
  cardType:String,
  userIds:[String],
  action:String,
  params:String
`;

export const mutations = `
    addGrantRequest(${commonRequestMutationParams}):JSON
    editGrantRequest(${commonRequestMutationParams}):JSON
    responseGrantRequest( description:String, response:String, requestId:String):JSON
    cancelGrantRequest(cardId:String,cardType:String):JSON
`;
