export const queries = {
  getConfig: `
        query zerocodeaiGetConfig {
            zerocodeaiGetConfig {
                apiKey
                projectName
            }
        }
    `,

  getAnalysis: `
        query zerocodeaiGetAnalysis($contentType: String, $contentTypeId: String) {
            zerocodeaiGetAnalysis(contentType: $contentType, contentTypeId: $contentTypeId)
        }
    `
};

export const mutations = {
  saveConfig: `
        mutation zerocodeaiSaveConfig($apiKey: String, $projectName: String) {
            zerocodeaiSaveConfig(apiKey: $apiKey, projectName: $projectName)
        }
    `,

  train: `
        mutation zerocodeaiTrain($file: String) {
            zerocodeaiTrain(file: $file)
        }
    `
};
