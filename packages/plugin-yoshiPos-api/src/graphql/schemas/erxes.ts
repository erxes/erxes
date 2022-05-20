export const types = `
  input Variables {
    key: String
  }
`;

export const queries = `
  erxesQuery(name: String!, variables: JSON): JSON
`;

export const mutations = `
  erxesMutation(name: String!, variables: JSON): JSON
`;
