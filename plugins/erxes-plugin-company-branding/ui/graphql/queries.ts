
const companyBrandings = `
query companyBrandings {
    companyBrandings{
      _id
      loginPageLogo
      mainIcon
      favicon
      textColor
      backgroundColor
      pageDesc
      url
    }
}
`;
const configs = `
query configs {
  configs {
    _id
    code
    value
  }
}
`;

export default {
  configs,
  companyBrandings
};
