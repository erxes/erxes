
const configs = `
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;

export const pullPolarisConfigs = `
  query pullPolarisConfigs($contentType: String) {
    pullPolarisConfigs(contentType: $contentType) 
  }
`;

export const pullPolarisData = `
  query pullPolarisData($contentType: String, $contentId: String, $kind: String, $codes: [String]) {
    pullPolarisData(contentType: $contentType, contentId: $contentId, kind: $kind, codes: $codes) 
  }
`;

export default {
  configs,
  pullPolarisConfigs,
  pullPolarisData
};
