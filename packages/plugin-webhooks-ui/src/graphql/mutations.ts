const commonParamsDef = `
  $actions: [WebhookActionInput]
  $url: String!
`;

const commonParams = `
  actions: $actions,
  url: $url,
`;

const webhooksEdit = `
  mutation webhooksEdit($_id: String!, ${commonParamsDef}) {
    webhooksEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const webhooksAdd = `
  mutation webhooksAdd(${commonParamsDef}) {
    webhooksAdd(${commonParams}){
      _id
    }
  }
`;

const webhooksRemove = `
  mutation webhooksRemove($_id: String!) {
    webhooksRemove(_id: $_id)
  }
`;

export default {
  webhooksEdit,
  webhooksAdd,
  webhooksRemove
};
