const commonFields = `
  $apiUrl: String,
  $isLocalUser: Boolean,
  $userDN: String,
  $adminDN: String
  $adminPassword: String
  $code: String,
`;

const commonVariables = `
  apiUrl: $apiUrl,
  isLocalUser: $isLocalUser,
  userDN: $userDN,
  adminDN: $adminDN
  adminPassword: $adminPassword
  code: $code,
`;

const adConfigUpdate = `
  mutation adConfigUpdate(${commonFields}) {
    adConfigUpdate(${commonVariables}) {
      _id
    }
  }
`;

const toCheckUsers = `
  mutation toCheckAdUsers($usercode: String, $userpass: String) {
    toCheckAdUsers(usercode: $usercode, userpass: $userpass)
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
