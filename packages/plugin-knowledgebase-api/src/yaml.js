module.exports = {
    beforeRow: 'yarn build plugin knowledgebase',
    additionalBuildSteps: [
      'cd erxes/packages/plugin-knowledgebase-api',
      'RUN apt-get update && apt-get install -y poppler-utils',
    ],
  };
  