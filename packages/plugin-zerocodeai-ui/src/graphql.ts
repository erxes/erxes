export const queries = {
  getConfig: `
        query zerocodeaiGetConfig {
            zerocodeaiGetConfig {
                apiKey
            }
        }
    `
};

export const mutations = {
  saveConfig: `
        mutation zerocodeaiSaveConfig($apiKey: String) {
            zerocodeaiSaveConfig(apiKey: $apiKey)
        }
    `
};
