import { gql } from '@apollo/client';

export const HELP_CENTER_CONFIG_BY_DOMAIN = gql`
  query portalHelpCenterConfigByDomain($domain: String!) {
    helpCenterGetConfigByDomain(domain: $domain) {
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
    }
  }
`;
