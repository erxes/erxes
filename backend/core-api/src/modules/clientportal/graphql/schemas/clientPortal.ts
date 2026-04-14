import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  enum TokenDeliveryMethod {
    cookie
    header
  }

  type OTPEmailConfig {
    emailSubject: String
    messageTemplate: String
    codeLength: Int
    duration: Int
    enableEmailVerification: Boolean
    enablePasswordlessLogin: Boolean
  }

  type OTPSMSConfig {
    messageTemplate: String
    codeLength: Int
    smsProvider: String
    duration: Int
    enablePhoneVerification: Boolean
    enablePasswordlessLogin: Boolean
  }

  type OTPConfig {
    email: OTPEmailConfig
    sms: OTPSMSConfig
  }

  type MultiFactorConfig {
    isEnabled: Boolean
    email: OTPEmailConfig
    sms: OTPSMSConfig
  }

  type TwoFactorConfig {
    messageTemplate: String
    codeLength: Int
    smsProvider: String
    isEnabled: Boolean
    duration: Int
    emailSubject: String
  }

  type OTPResendConfig {
    cooldownPeriodInSeconds: Int
    maxAttemptsPerHour: Int
  }

  type ResetPasswordConfig {
    mode: String
    emailSubject: String
    emailContent: String
  }

  type SMSProvidersConfig {
    callPro: JSON
    twilio: JSON
  }

  type AuthConfig {
    accessTokenExpirationInDays: Int
    refreshTokenExpirationInDays: Int
    deliveryMethod: TokenDeliveryMethod
  }

  type Auth {
    authConfig: AuthConfig
    googleOAuth: GoogleOAuthConfig
    facebookOAuth: FacebookOAuthConfig
    socialpayConfig: SocialpayConfig
    tokiConfig: TokiConfig
  }

  type SecurityAuthConfig {
    otpConfig: OTPConfig
    multiFactorConfig: MultiFactorConfig
    otpResendConfig: OTPResendConfig
    resetPasswordConfig: ResetPasswordConfig
  }

  type MailConfig {
    subject: String
    invitationContent : String
    registrationContent : String
  }

  type ManualVerificationConfig {
    userIds: [String]
    verifyCustomer: Boolean
    verifyCompany: Boolean
  }

  type PasswordVerificationConfig {
    verifyByOTP: Boolean
    emailSubject: String
    emailContent: String
    smsContent: String
  }


  type SocialpayConfig {
    enableSocialpay: Boolean
    publicKey: String
    certId: String
  }

  type TokiConfig {
    enableToki: Boolean
    merchantId: String
    apiKey: String
    username: String
    password: String
    production: Boolean
  }

  type TestUser {
    enableTestUser: Boolean
    email: String
    phone: String
    password: String
    otp: String
  }

  type GoogleOAuthConfig {
    credentials: String
    clientId: String
    clientSecret: String
    redirectUri: String
  }

  type FacebookOAuthConfig {
    appId: String
    appSecret: String
    redirectUri: String
  }

  type FirebaseConfig {
    serviceAccountKey: String
    enabled: Boolean
  }

type ClientPortal {
    _id: String!
    name: String!
    description: String
    domain: String

    token: String
    url: String
    erxesIntegrationToken: String
  
    auth: Auth
    securityAuthConfig: SecurityAuthConfig
    smsProvidersConfig: SMSProvidersConfig
    manualVerificationConfig: ManualVerificationConfig
    enableManualVerification: Boolean
    testUser: TestUser
    firebaseConfig: FirebaseConfig

    createdAt: Date
    updatedAt: Date
  }

  type ClientPortalListResponse {
    list: [ClientPortal]
    pageInfo: PageInfo
    totalCount: Int
  }

  input OTPEmailConfigInput {
    emailSubject: String
    messageTemplate: String
    codeLength: Int
    duration: Int
    enableEmailVerification: Boolean
    enablePasswordlessLogin: Boolean
  }

  input OTPSMSConfigInput {
    messageTemplate: String
    codeLength: Int
    smsProvider: String
    duration: Int
    enablePhoneVerification: Boolean
    enablePasswordlessLogin: Boolean
  }

  input OTPConfigInput {
    email: OTPEmailConfigInput
    sms: OTPSMSConfigInput
  }

  input MultiFactorConfigInput {
    isEnabled: Boolean
    email: OTPEmailConfigInput
    sms: OTPSMSConfigInput
  }

  input TwoFactorConfigInput {
    messageTemplate: String
    codeLength: Int
    smsProvider: String
    isEnabled: Boolean
    duration: Int
    emailSubject: String
  }

  input OTPResendConfigInput {
    cooldownPeriodInSeconds: Int
    maxAttemptsPerHour: Int
  }

  input ResetPasswordConfigInput {
    mode: String
    emailSubject: String
    emailContent: String
  }

  input SMSProvidersConfigInput {
    callPro: JSON
    twilio: JSON
  }

  input AuthConfigInput {
    accessTokenExpirationInDays: Int
    refreshTokenExpirationInDays: Int
    deliveryMethod: TokenDeliveryMethod
  }

  input AuthInput {
    authConfig: AuthConfigInput
    googleOAuth: GoogleOAuthConfigInput
    facebookOAuth: FacebookOAuthConfigInput
    socialpayConfig: SocialpayConfigInput
    tokiConfig: TokiConfigInput
  }

  input SecurityAuthConfigInput {
    otpConfig: OTPConfigInput
    multiFactorConfig: MultiFactorConfigInput
    otpResendConfig: OTPResendConfigInput
    resetPasswordConfig: ResetPasswordConfigInput
  }


  input MailConfigInput {
    subject: String
    invitationContent : String
    registrationContent : String
  }

  input ManualVerificationConfigInput {
    userIds: [String]
    verifyCustomer: Boolean
    verifyCompany: Boolean
  }

  input PasswordVerificationConfigInput {
    verifyByOTP: Boolean
    emailSubject: String
    emailContent: String
    smsContent: String
  }

  input SocialpayConfigInput {
    enableSocialpay: Boolean
    publicKey: String
    certId: String
  }

  input TokiConfigInput {
    enableToki: Boolean
    merchantId: String  
    apiKey: String
    username: String
    password: String
    production: Boolean
  }

  input TestUserInput {
    enableTestUser: Boolean
    email: String
    phone: String
    password: String
    otp: String
  }

  input GoogleOAuthConfigInput {
    credentials: String
    clientId: String
    clientSecret: String
    redirectUri: String
  }

  input FacebookOAuthConfigInput {
    appId: String
    appSecret: String
    redirectUri: String
  }

  input FirebaseConfigInput {
    serviceAccountKey: String
    enabled: Boolean
  }

  input ClientPortalConfigInput {
    name: String
    description: String
    domain: String

    token: String
    url: String
    erxesIntegrationToken: String
  
    auth: AuthInput
    securityAuthConfig: SecurityAuthConfigInput
    smsProvidersConfig: SMSProvidersConfigInput
    manualVerificationConfig: ManualVerificationConfigInput
    enableManualVerification: Boolean
    testUser: TestUserInput
    firebaseConfig: FirebaseConfigInput
  }

  input IClientPortalFilter {
    _id: String
    ${GQL_CURSOR_PARAM_DEFS}
  } 

  type CPExamplePost {
    id: String
    title: String
    content: String
  }

`;

export const queries = `
  getClientPortals(filter: IClientPortalFilter): ClientPortalListResponse
  getClientPortal(_id: String): ClientPortal
  getCPExamplePosts: [CPExamplePost]
`;

export const mutations = `
  clientPortalAdd (
    name: String!
  ): ClientPortal
  clientPortalUpdate (
    _id: String!
    clientPortal: ClientPortalConfigInput
  ): ClientPortal
  clientPortalChangeToken (_id: String!): String
  clientPortalDelete (_id: String!): JSON
`;
