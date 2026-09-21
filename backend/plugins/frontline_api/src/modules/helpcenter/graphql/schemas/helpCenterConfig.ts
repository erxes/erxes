export const types = `
  type HelpCenterConfigStyles {
    mainLogo: String
    favicon: String

    bodyColor: String
    headerColor: String
    footerColor: String
    helpCenterColor: String
    backgroundColor: String
    activeTabColor: String

    baseFont: String
    baseColor: String
    headingFont: String
    headingColor: String
    linkColor: String
    linkHoverColor: String

    primaryButtonColor: String
    secondaryButtonColor: String
    dividerColor: String

    headerHtml: String
    footerHtml: String
  }

  input HelpCenterConfigStylesInput {
    mainLogo: String
    favicon: String

    bodyColor: String
    headerColor: String
    footerColor: String
    helpCenterColor: String
    backgroundColor: String
    activeTabColor: String

    baseFont: String
    baseColor: String
    headingFont: String
    headingColor: String
    linkColor: String
    linkHoverColor: String

    primaryButtonColor: String
    secondaryButtonColor: String
    dividerColor: String

    headerHtml: String
    footerHtml: String
  }

  type HelpCenterHeader {
    wordmark: String
    homeLabel: String
    formsLabel: String
    announcementsLabel: String
    searchPlaceholder: String
  }

  input HelpCenterHeaderInput {
    wordmark: String
    homeLabel: String
    formsLabel: String
    announcementsLabel: String
    searchPlaceholder: String
  }

  type HelpCenterFooterLink {
    label: String
    url: String
  }

  input HelpCenterFooterLinkInput {
    label: String
    url: String
  }

  type HelpCenterFooterColumn {
    heading: String
    links: [HelpCenterFooterLink]
  }

  input HelpCenterFooterColumnInput {
    heading: String
    links: [HelpCenterFooterLinkInput]
  }

  type HelpCenterFooter {
    logo: String
    description: String
    copyright: String
    columns: [HelpCenterFooterColumn]
  }

  input HelpCenterFooterInput {
    logo: String
    description: String
    copyright: String
    columns: [HelpCenterFooterColumnInput]
  }

  type HelpCenterConfig {
    _id: String!
    title: String
    description: String
    url: String
    erxesAppToken: String
    brandId: String
    brand: Brand
    languageCode: String

    kbToggle: Boolean
    kbLabel: String
    kbTopicId: String
    kbTopic: KnowledgeBaseTopic

    ticketToggle: Boolean
    ticketLabel: String
    ticketChannelId: String
    ticketPipelineId: String
    ticketStatusId: String

    color: String
    backgroundImage: String
    styles: HelpCenterConfigStyles
    header: HelpCenterHeader
    footer: HelpCenterFooter

    createdBy: String
    modifiedBy: String
    createdAt: Date
    updatedAt: Date
  }

  input HelpCenterConfigInput {
    _id: String
    title: String!
    description: String
    url: String
    erxesAppToken: String
    brandId: String
    languageCode: String

    kbToggle: Boolean
    kbLabel: String
    kbTopicId: String

    ticketToggle: Boolean
    ticketLabel: String
    ticketChannelId: String
    ticketPipelineId: String
    ticketStatusId: String

    color: String
    backgroundImage: String
    styles: HelpCenterConfigStylesInput
    header: HelpCenterHeaderInput
    footer: HelpCenterFooterInput
  }
`;

export const queries = `
  helpCenterConfig(_id: String!): HelpCenterConfig
  helpCenterConfigs(page: Int, perPage: Int, searchValue: String, brandId: String): [HelpCenterConfig]
  helpCenterConfigsTotalCount(searchValue: String, brandId: String): Int
  helpCenterGetConfigByDomain(clientPortalName: String): HelpCenterConfig
`;

export const mutations = `
  helpCenterConfigUpdate(config: HelpCenterConfigInput!): HelpCenterConfig
  helpCenterConfigRemove(_id: String!): JSON
`;
