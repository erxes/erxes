const commonFields = `
  $apiUrl: String,
  $localUser: Boolean,
  $userDN: String,
  $code: String,
`;

const commonVariables = `
  apiUrl: $apiUrl,
  localUser: $localUser,
  userDN: $userDN,
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
