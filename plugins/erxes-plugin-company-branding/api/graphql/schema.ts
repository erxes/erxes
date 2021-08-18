export const types = `
  type CompanyBranding {
    _id: String
    textColor: String
    backgroundColor: String
    pageDesc: String
    url: String
    email: String
    type: String
  }
`;

const commonFields = `
  textColor: String
  backgroundColor: String
  pageDesc: String
  url: String
  email: String
  type: String
`;

export const queries = `
  companyBrandings: CompanyBranding
`;

export const mutations = `
  companyBrandingSave(${commonFields}): CompanyBranding
`;
