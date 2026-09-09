import { gql } from '@apollo/client';

export const HELP_CENTER_CONFIG_FIELDS = gql`
  fragment HelpCenterConfigFields on HelpCenterConfig {
    _id
    title
    description
    url
    erxesAppToken
    brandId
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

    brand {
      _id
      name
    }
    createdAt
  }
`;

export const GET_HELP_CENTERS = gql`
  ${HELP_CENTER_CONFIG_FIELDS}
  query frontlineHelpCenterList(
    $page: Int
    $perPage: Int
    $searchValue: String
    $brandId: String
  ) {
    helpCenterConfigs(
      page: $page
      perPage: $perPage
      searchValue: $searchValue
      brandId: $brandId
    ) {
      ...HelpCenterConfigFields
    }
    helpCenterConfigsTotalCount(
      searchValue: $searchValue
      brandId: $brandId
    )
  }
`;

export const GET_HELP_CENTER = gql`
  ${HELP_CENTER_CONFIG_FIELDS}
  query frontlineHelpCenterDetail($_id: String!) {
    helpCenterConfig(_id: $_id) {
      ...HelpCenterConfigFields
    }
  }
`;
