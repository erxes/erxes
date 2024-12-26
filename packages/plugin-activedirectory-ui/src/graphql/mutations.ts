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

export default {
  adConfigUpdate,
};
