export const queries = {
  getConfig: `
        query zerocodeaiGetConfig {
            zerocodeaiGetConfig {
                apiKey
                projectName
            }
        }
    `
};

export const mutations = {
  saveConfig: `
        mutation zerocodeaiSaveConfig($apiKey: String, $projectName: String) {
            zerocodeaiSaveConfig(apiKey: $apiKey, projectName: $projectName)
        }
    `
};
