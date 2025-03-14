const adConfigs = `
query adConfigs($code: String!) {
  adConfigs(code: $code) {
    apiUrl
    useDN
    baseDN
    adminDN
    adminPassword
  }
}
`;

export default {
  adConfigs,
};
