export const types = `
  type MastraErxesTool {
    plugin: String
    module: String
    operation: String
    operationType: String
    description: String
    graphqlArgs: JSON
    returnType: JSON
  }
`;

export const queries = `
  mastraAvailableErxesTools: [MastraErxesTool]
`;

export const mutations = ``;
