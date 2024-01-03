const commonParamDefs = `$name: String, $userGroupId: String, $expireDate: Date, $allowAllPermission: Boolean, $noExpire: Boolean`;
const commonParams = `name: $name, userGroupId: $userGroupId, expireDate: $expireDate, allowAllPermission: $allowAllPermission, noExpire: $noExpire`;

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
