const commonParamsDef = `
  $name: String!,
  $messengerId: String,
  $leadIds: [String],
  $kbTopicId: String,
`;

const commonParams = `
  name: $name,
  messengerId: $messengerId,
  leadIds: $leadIds,
  kbTopicId: $kbTopicId,
`;

const scriptsAdd = `
  mutation scriptsAdd(${commonParamsDef}) {
    scriptsAdd(${commonParams}) {
      _id
    }
  }
`;

const scriptsEdit = `
  mutation scriptsEdit($_id: String!, ${commonParamsDef}) {
    scriptsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const scriptsRemove = `
  mutation scriptsRemove($_id: String!) {
    scriptsRemove(_id: $_id)
  }
`;

export default {
  scriptsAdd,
  scriptsEdit,
  scriptsRemove
};
