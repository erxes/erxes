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
      url
      erxesIntegrationToken
      enableManualVerification
      auth {
        authConfig {
          deliveryMethod
          accessTokenExpirationInDays
          refreshTokenExpirationInDays
        }
        googleOAuth {
          clientId
          clientSecret
          credentials
          redirectUri
        }
        facebookOAuth {
          appId
          appSecret
          redirectUri
        }
        socialpayConfig {
          enableSocialpay
          publicKey
          certId
        }
        tokiConfig {
          enableToki
          merchantId
          apiKey
          username
          password
          production
        }
      }
      securityAuthConfig {
        otpConfig {
          email {
            emailSubject
            messageTemplate
            codeLength
            duration
            enableEmailVerification
            enablePasswordlessLogin
          }
          sms {
            messageTemplate
            codeLength
            smsProvider
            duration
            enablePhoneVerification
            enablePasswordlessLogin
          }
        }
        multiFactorConfig {
          isEnabled
          email {
            emailSubject
            messageTemplate
            codeLength
            duration
          }
          sms {
            messageTemplate
            codeLength
            smsProvider
            duration
          }
        }
        otpResendConfig {
          cooldownPeriodInSeconds
          maxAttemptsPerHour
        }
        resetPasswordConfig {
          mode
          emailSubject
          emailContent
        }
      }
      smsProvidersConfig {
        callPro
        twilio
      }
      manualVerificationConfig {
        userIds
        verifyCustomer
        verifyCompany
      }
      testUser {
        enableTestUser
        email
        phone
        password
        otp
      }
      firebaseConfig {
        enabled
        serviceAccountKey
      }
    }
  }
`;
