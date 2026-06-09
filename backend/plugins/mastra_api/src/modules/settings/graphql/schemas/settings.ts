export const types = `
  type MastraSettings {
    _id: String
    erxesApiUrl: String
    erxesApiToken: String
    defaultAgentId: String
  }

  input MastraSettingsInput {
    erxesApiUrl: String
    erxesApiToken: String
    defaultAgentId: String
  }
`;

export const queries = `
  mastraSettings: MastraSettings
`;

export const mutations = `
  mastraSettingsSave(doc: MastraSettingsInput!): MastraSettings
`;
