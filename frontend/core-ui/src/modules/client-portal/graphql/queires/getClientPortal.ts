import { gql } from '@apollo/client';

export const GET_CLIENT_PORTAL = gql`
  query getClientPortal($_id: String!) {
    getClientPortal(_id: $_id) {
      _id
      name
      description
      domain
      createdAt
      updatedAt
      token
      tokenPassMethod
      refreshTokenExpiration
      tokenExpiration
      enableManualVerification
      enableOTP
      enablePasswordVerification
      enableSocialpay
      enableTestUser
      enableToki
      enableTwoFactor
      googleClientId
      googleClientSecret
      googleCredentials
      googleRedirectUri
      facebookAppId
      otpConfig {
        smsTransporterType
        emailSubject
        content
        codeLength
        expireAfter
        loginWithOTP
      }
      twoFactorConfig {
        codeLength
        content
        emailSubject
        expireAfter
        smsTransporterType
      }
      verificationMailConfig {
        subject
        invitationContent
        registrationContent
      }
      passwordVerificationConfig {
        emailContent
        emailSubject
        smsContent
        verifyByOTP
      }
      manualVerificationConfig {
        userIds
        verifyCustomer
        verifyCompany
      }
      socialpayConfig {
        certId
        publicKey
      }
      tokiConfig {
        merchantId
        apiKey
        username
        password
      }
      testUserEmail
      testUserOTP
      testUserPassword
      testUserPhone
      verificationType
      verificationCodeExpiresIn
    }
  }
`;
