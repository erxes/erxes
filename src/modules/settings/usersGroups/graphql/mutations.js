const commonParamsDef = `
  $name: String!,
  $description: String,
`;

const commonParams = `
  name: $name,
  description: $description,
`;

const usersGroupsAdd = `
  mutation usersGroupsAdd(${commonParamsDef}) {
    usersGroupsAdd(${commonParams}) {
      _id
    }
  }
`;

const usersGroupsEdit = `
  mutation usersGroupsEdit($_id: String!, ${commonParamsDef}) {
    usersGroupsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const usersGroupsRemove = `
  mutation usersGroupsRemove($_id: String!) {
    usersGroupsRemove(_id: $_id)
  }
`;

export default { usersGroupsAdd, usersGroupsEdit, usersGroupsRemove };
