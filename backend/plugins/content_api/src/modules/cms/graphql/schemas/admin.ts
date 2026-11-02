export const types = `
  type FixTranslationIndexResponse {
    success: Boolean!
    message: String
    error: String
    details: FixTranslationIndexDetails
  }

  type FixTranslationIndexDetails {
    oldIndexRemoved: Boolean
    nullDocumentsDeleted: Int
    correctIndexCreated: Boolean
  }
`;

export const mutations = `
  cmsFixTranslationIndex: FixTranslationIndexResponse
`;

export const queries = '';

export const inputs = '';
