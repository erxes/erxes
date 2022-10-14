export const queries = {
  getConfig: `
        query zerocodeaiGetConfig {
            zerocodeaiGetConfig {
                apiKey
                projectName
            }
        }
    `,

  trainings: `
        query zerocodeaiTrainings {
            zerocodeaiTrainings {
                date
                file
            }
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
