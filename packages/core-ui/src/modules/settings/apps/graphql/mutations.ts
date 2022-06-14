const commonParamDefs = `$name: String, $userGroupId: String, $expireDate: Date`;
const commonParams = `name: $name, userGroupId: $userGroupId, expireDate: $expireDate`;

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

export default { appsAdd, appsEdit, appsRemove };
