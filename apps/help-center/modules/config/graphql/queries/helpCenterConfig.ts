import { gql } from '@apollo/client';

const CONFIG_FIELDS = `
  _id
  title
  description
  url
  erxesAppToken
  languageCode

  kbToggle
  kbLabel
  kbTopicId

  ticketToggle
  ticketLabel
  ticketChannelId
  ticketPipelineId
  ticketStatusId

  color
  backgroundImage
  styles {
    mainLogo
    favicon
    bodyColor
    headerColor
    footerColor
    helpCenterColor
    backgroundColor
    activeTabColor
    baseFont
    baseColor
    headingFont
    headingColor
    linkColor
    linkHoverColor
    primaryButtonColor
    secondaryButtonColor
    dividerColor
    headerHtml
    footerHtml
  }
`;

const SOURCE_FIELDS = `
  formChannelId
  formIds

  cmsId
  cmsAppToken
  cmsConfigs {
    cmsId
    cmsAppToken
  }
`;

const LAYOUT_FIELDS = `
  header {
    wordmark
    homeLabel
    formsLabel
    announcementsLabel
    searchPlaceholder
  }
  footer {
    logo
    description
    copyright
    columns {
      heading
      links {
        label
        url
      }
    }
  }
`;

export const HELP_CENTER_CONFIG_BY_DOMAIN = gql`
  query portalHelpCenterConfigByDomain {
    helpCenterGetConfigByDomain {
      ${CONFIG_FIELDS}
      ${SOURCE_FIELDS}
      ${LAYOUT_FIELDS}
    }
  }
`;

export const HELP_CENTER_CONFIG_BY_DOMAIN_PLAIN = gql`
  query portalHelpCenterConfigByDomainPlain {
    helpCenterGetConfigByDomain {
      ${CONFIG_FIELDS}
    }
  }
`;

export const HELP_CENTER_CONFIG_BY_DOMAIN_LEGACY = gql`
  query portalHelpCenterConfigByDomainLegacy($domain: String!) {
    helpCenterGetConfigByDomain(domain: $domain) {
      ${CONFIG_FIELDS}
    }
  }
`;
