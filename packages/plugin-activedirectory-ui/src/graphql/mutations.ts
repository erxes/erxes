const commonFields = `
  $apiUrl: String,
  $code: String,
`;

const commonVariables = `
  apiUrl: $apiUrl,
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
