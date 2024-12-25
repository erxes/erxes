const adConfigs = `
query adConfigs($code: String!) {
  adConfigs(code: $code) {
    apiUrl
    adminDN
    adminPassword
  }
}
`;

export default {
  adConfigs,
};
