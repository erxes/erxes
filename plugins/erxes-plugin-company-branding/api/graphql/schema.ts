export const types = `
  type CompanyBranding {
    _id: String
    loginPageLogo: String
    mainIcon: String
    favicon: String
    textColor: String
    backgroundColor: String
    pageDesc: String
    url: String
  }
`;

const commonFields = `
  loginPageLogo: String
  mainIcon: String
  favicon: String
  textColor: String
  backgroundColor: String
  pageDesc: String
  url: String
`;

export const queries = `
  companyBrandings: CompanyBranding
`;

export const mutations = `
  companyBrandingSave(${commonFields}): CompanyBranding
  companyBrandingEdit(_id: String, ${commonFields}): CompanyBranding
`;
