const commonFields = `
  $apiUrl: String,
  $localUser: Boolean,
  $userDN: String,
  $adminDN: String
  $adminPassword: String
  $code: String,
`;

const commonVariables = `
  apiUrl: $apiUrl,
  localUser: $localUser,
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
