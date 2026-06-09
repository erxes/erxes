export const types = `
  type MastraSettings {
    _id: String
    erxesApiUrl: String
    erxesApiToken: String
    defaultAgentId: String
    memoryDbPath: String
  }

  input MastraSettingsInput {
    erxesApiUrl: String
    erxesApiToken: String
    defaultAgentId: String
    memoryDbPath: String
  }
`;

export const queries = `
  mastraSettings: MastraSettings
`;

export const mutations = `
  mastraSettingsSave(doc: MastraSettingsInput!): MastraSettings
`;
