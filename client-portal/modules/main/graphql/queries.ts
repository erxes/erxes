export const clientPortalGetConfig = `
  query clientPortalGetConfigByDomain {
    clientPortalGetConfigByDomain {
      _id
      name
      description
      logo
      icon
      url
      messengerBrandCode
      knowledgeBaseLabel
      knowledgeBaseTopicId
      taskLabel
      taskPublicPipelineId
      taskStageId
      ticketLabel
      ticketStageId
      publicTaskToggle
      ticketToggle
      taskToggle
      kbToggle

      styles {
        bodyColor
        headerColor
        footerColor
        helpColor
        backgroundColor
        activeTabColor
        baseColor
        headingColor
        linkColor
        linkHoverColor
        baseFont
        headingFont
        dividerColor
        primaryBtnColor
        secondaryBtnColor
      }
    }
  }
`;
