export const types = `
  type GrantRequest {
    action:String,
    userIds:String,
    users:[User]
  }

  type Action  {
    label:String,
    action:String
  }

`;

export const queries = `
  grantRequest(cardId:String,cardType:String):GrantRequest
  getGrantRequestActions:[Action]
`;

const commonRequestMutationParams = `
  cardId:String,
  cardType:String
  userIds:[String],
  action:String
`;

export const mutations = `
    addGrantRequest(${commonRequestMutationParams}):JSON
`;
