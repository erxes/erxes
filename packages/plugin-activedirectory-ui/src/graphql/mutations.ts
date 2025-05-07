const commonFields = `
  $apiUrl: String
  $baseDN: String
  $adminDN: String
  $adminPassword: String
  $code: String
`;

const commonVariables = `
  apiUrl: $apiUrl
  baseDN: $baseDN
  adminDN: $adminDN
  adminPassword: $adminPassword
  code: $code
`;

const adConfigUpdate = `
  mutation adConfigUpdate(${commonFields}) {
    adConfigUpdate(${commonVariables}) {
      _id
    }
  }
`;

const toCheckUsers = `
  mutation toCheckAdUsers {
    toCheckAdUsers
  }
`;

const toSyncUsers = `
  mutation toSyncAdUsers($action: String, $users: [JSON]) {
    toSyncAdUsers(action: $action, users: $users)
  }
`;

export default {
  adConfigUpdate,
  toCheckUsers,
  toSyncUsers,
};
