const commonParamDefs = `$name: String, $userGroupId: String`;
const commonParams = `name: $name, userGroupId: String`;

const appsAdd = `
  mutation appsAdd(${commonParamDefs}) {
    appsAdd(${commonParams}) {
      _id
    }
  }
`;

const appsEdit = `
  mutation appsEdit($_id: String!, ${commonParamDefs}) {
    appsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const appsRemove = `
  mutation appsRemove($_id: String!) {
    appsRemove(_id: $_id)
  }
`;

export default { appsAdd, appsEdit, appsRemove }
