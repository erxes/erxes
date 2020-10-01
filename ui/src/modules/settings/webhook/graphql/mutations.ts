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
  mutation webhooksAdd($isOutgoing: Boolean!, ${commonParamsDef}) {
    webhooksAdd(isOutgoing: $isOutgoing, ${commonParams}){
      _id
    }
  }
`;

const webhooksRemove = `
  mutation webhooksRemove($ids: [String!]!) {
    webhooksRemove(ids: $ids)
  }
`;


export default {
  webhooksEdit,
  webhooksAdd,
  webhooksRemove
};
