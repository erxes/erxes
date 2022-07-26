export const types = `
  type Remainder @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    date: Date
    description: String
    status: String
    contentType: String
    contentId: String
  }
`;

export const queries = `
  getTransaction(contentType: String, contentId: String):
`;

export const mutations = `

`;
