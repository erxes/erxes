module.exports = {
  repositoryFactory: ({ securityContext }) => {
    return {
      dataSchemaFiles: async () => {
        await Promise.resolve([
          { fileName: 'file.js', content: 'contents of file' }
        ]);
      }
    };
  },

  dbType: ({ dataSource }) => 'postgres'
};
