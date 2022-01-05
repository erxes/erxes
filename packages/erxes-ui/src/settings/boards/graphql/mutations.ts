const commonParamsDef = `
  $name: String!,
  $type: String!
`;

const commonParams = `
  name: $name,
  type: $type
`;

const boardAdd = `
  mutation boardsAdd(${commonParamsDef}) {
    boardsAdd(${commonParams}) {
      _id
    }
  }
`;

const boardEdit = `
  mutation boardsEdit($_id: String!, ${commonParamsDef}) {
    boardsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const boardRemove = `
  mutation boardsRemove($_id: String!) {
    boardsRemove(_id: $_id)
  }
`;

export default {
  boardAdd,
  boardEdit,
  boardRemove
};
