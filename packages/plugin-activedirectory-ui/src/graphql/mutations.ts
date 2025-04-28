const commonFields = `
  $apiUrl: String
  $useDN: Boolean
  $baseDN: String
  $adminDN: String
  $adminPassword: String
  $code: String
`;

const commonVariables = `
  apiUrl: $apiUrl
  useDN: $useDN
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
