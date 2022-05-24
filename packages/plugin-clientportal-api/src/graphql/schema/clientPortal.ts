export const types = () => `
  type OTPConfig{
    content: String
    smsTransporterType: String
    emailTransporterType: String
  }

  input OTPConfigInput {
    content: String
    smsTransporterType: String
    emailTransporterType: String
  }

  type ClientPortal {
    _id: String!
    name: String!
    description: String
    url: String
    logo: String
    icon: String
    domain: String
    dnsStatus: String
    styles: Styles
    mobileResponsive: Boolean
  
    otpConfig: OTPConfig
  }

  type Styles {
    bodyColor: String
    headerColor: String
    footerColor: String
    helpColor: String
    backgroundColor: String
    activeTabColor: String
    baseColor: String
    headingColor: String
    linkColor: String
    linkHoverColor: String
    baseFont: String
    headingFont: String
    dividerColor: String
    primaryBtnColor: String
    secondaryBtnColor: String
  }

  input StylesParams {
    bodyColor: String
    headerColor: String
    footerColor: String
    helpColor: String
    backgroundColor: String
    activeTabColor: String
    baseColor: String
    headingColor: String
    linkColor: String
    linkHoverColor: String
    dividerColor: String
    primaryBtnColor: String
    secondaryBtnColor: String
    baseFont: String
    headingFont: String
  }
`;

export const queries = () => `
  clientPortalGetConfigs(page: Int, perPage: Int): [ClientPortal]
  clientPortalGetConfig(_id: String!): ClientPortal
  clientPortalGetLast: ClientPortal
  clientPortalConfigsTotalCount: Int
`;

export const mutations = () => `
  clientPortalConfigUpdate (
    _id: String
    name: String
    description: String
    logo: String
    icon: String
    url: String
    domain: String
    styles: StylesParams
    mobileResponsive: Boolean

    otpConfig: OTPConfigInput
  ): ClientPortal

  clientPortalRemove (_id: String!): JSON
`;
