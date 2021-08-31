
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
          email
          type
          template
        }
    }
  `;


export default {
  companyBrandings
};
