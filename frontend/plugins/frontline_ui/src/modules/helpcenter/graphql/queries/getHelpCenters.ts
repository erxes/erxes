import { gql } from '@apollo/client';

export const GET_HELP_CENTERS = gql`
  query frontlineHelpCenterList(
    $page: Int
    $perPage: Int
    $searchValue: String
    $brandId: String
  ) {
    knowledgeBaseTopics(
      page: $page
      perPage: $perPage
      searchValue: $searchValue
      brandId: $brandId
    ) {
      _id
      title
      code
      description
      languageCode
      color
      backgroundImage
      notificationSegmentId
      createdDate
      url
      kbToggle
      kbLabel
      kbTopicId
      ticketToggle
      ticketLabel
      ticketChannelId
      ticketPipelineId
      ticketStatusId
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
      categories {
        _id
        title
        code
        description
        icon
        numOfArticles
      }
    }
    knowledgeBaseTopicsTotalCount
  }
`;
