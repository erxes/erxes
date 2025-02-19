const commonFields = `
  $apiUrl: String
  $isLocalUser: Boolean
  $userDN: String
  $baseDN: String
  $adminDN: String
  $adminPassword: String
  $code: String
`;

const commonVariables = `
  apiUrl: $apiUrl
  isLocalUser: $isLocalUser
  userDN: $userDN
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
  mutation toCheckAdUsers($userName: String, $userPass: String) {
    toCheckAdUsers(userName: $userName, userPass: $userPass)
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
