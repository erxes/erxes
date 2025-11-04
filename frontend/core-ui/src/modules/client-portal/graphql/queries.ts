import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_PAGE_INFO,
  GQL_CURSOR_PARAMS,
} from 'erxes-ui';

export const CLIENT_PORTAL_GET_CONFIGS = gql`
  query clientPortalGetConfigs($kind: BusinessPortalKind, $search: String, ${GQL_CURSOR_PARAM_DEFS}) {
    clientPortalGetConfigs(kind: $kind, search: $search, ${GQL_CURSOR_PARAMS}) {
      list {
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
        tokiConfig {
          merchantId
          apiKey
          username
          password
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
      ${GQL_PAGE_INFO}
      totalCount
    }
  }
`;

export const CLIENT_PORTAL_GET_CONFIG = gql`
  query clientPortalGetConfig($_id: String!) {
    clientPortalGetConfig(_id: $_id) {
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
      tokiConfig {
        merchantId
        apiKey
        username
        password
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
