export const types = `
  type GrantRequest {
    action:String,
    params:String,
    requesterId:String,
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

export const queries = `
  grantRequest(cardId:String,cardType:String):GrantRequest
  getGrantRequestActions:[Action]
`;

const commonRequestMutationParams = `
  cardId:String,
  cardType:String,
  requesterId:String,
  userIds:[String],
  action:String,
  params:String
`;

export const mutations = `
    addGrantRequest(${commonRequestMutationParams}):JSON
    editGrantRequest(${commonRequestMutationParams}):JSON
    cancelGrantRequest(cardId:String,cardType:String):JSON
`;
