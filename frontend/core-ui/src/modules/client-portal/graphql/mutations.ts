import { gql } from '@apollo/client';

export const CLIENT_PORTAL_CONFIG_UPDATE = gql`
  mutation ClientPortalConfigUpdate($config: ClientPortalConfigInput!) {
    clientPortalConfigUpdate(config: $config) {
      _id
      name
      url
      kind
      description
      logo
      icon
      headerHtml
      footerHtml
      domain
      dnsStatus
      messengerBrandCode
      knowledgeBaseLabel
      knowledgeBaseTopicId
      ticketLabel
      dealLabel
      purchaseLabel
      taskPublicPipelineId
      taskPublicBoardId
      taskPublicLabel
      taskLabel
      taskStageId
      taskPipelineId
      taskBoardId
      ticketStageId
      ticketPipelineId
      ticketBoardId
      dealStageId
      dealPipelineId
      dealBoardId
      purchaseStageId
      purchasePipelineId
      purchaseBoardId
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
        __typename
      }
      mobileResponsive
      googleCredentials
      googleClientId
      googleClientSecret
      googleRedirectUri
      facebookAppId
      erxesAppToken
      kbToggle
      publicTaskToggle
      ticketToggle
      taskToggle
      dealToggle
      purchaseToggle
      otpConfig {
        smsTransporterType
        content
        codeLength
        loginWithOTP
        expireAfter
        emailSubject
        __typename
      }
      twoFactorConfig {
        smsTransporterType
        content
        codeLength
        enableTwoFactor
        expireAfter
        emailSubject
        __typename
      }
      mailConfig {
        subject
        invitationContent
        registrationContent
        __typename
      }
      manualVerificationConfig {
        userIds
        verifyCustomer
        verifyCompany
        __typename
      }
      passwordVerificationConfig {
        verifyByOTP
        emailSubject
        emailContent
        smsContent
        __typename
      }
      socialpayConfig {
        certId
        publicKey
        __typename
      }
      testUserEmail
      testUserPhone
      testUserPassword
      testUserOTP
      tokenExpiration
      refreshTokenExpiration
      tokenPassMethod
      vendorParentProductCategoryId
      language
      environmentVariables {
        key
        value
        __typename
      }
      __typename
    }
  }
`;

export const CLIENT_PORTAL_DEPLOY_VERCEL = gql`
  mutation ClientPortalDeployVercel($_id: String!) {
    clientPortalDeployVercel(_id: $_id)
  }
`;

export const CLIENT_PORTAL_REMOVE = gql`
  mutation clientPortalRemove($_id: String!) {
    clientPortalRemove(_id: $_id)
  }
`;
