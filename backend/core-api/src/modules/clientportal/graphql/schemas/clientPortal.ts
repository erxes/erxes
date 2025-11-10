export const types = `
  enum TokenPassMethod {
    cookie
    header
  }

  type OTPConfig {
    content: String
    codeLength: Int
    smsTransporterType: String
    loginWithOTP: Boolean
    expireAfter: Int
    emailSubject: String
  }

  type TwoFactorConfig {
    content: String
    codeLength: Int
    smsTransporterType: String
    enableTwoFactor: Boolean
    expireAfter: Int
    emailSubject: String
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
    publicKey: String
    certId: String
  }

  type TokiConfig {
    merchantId: String
    apiKey: String
    username: String
    password: String
  }


type ClientPortal {
    _id: String!
    name: String!
    description: String
    domain: String

    googleCredentials: JSON
    googleClientId: String
    googleClientSecret: String
    googleRedirectUri: String
    facebookAppId: String
    erxesAppToken: String
  
    otpConfig: OTPConfig
    twoFactorConfig: TwoFactorConfig

    mailConfig: MailConfig
    manualVerificationConfig: ManualVerificationConfig
    passwordVerificationConfig: PasswordVerificationConfigInput

    tokenExpiration: Int
    refreshTokenExpiration: Int
    tokenPassMethod: TokenPassMethod
    vendorParentProductCategoryId: String

    testUserEmail: String
    testUserPhone: String
    testUserPassword: String
    testUserOTP: String

    socialpayConfig: SocialpayConfig
    tokiConfig: TokiConfigInput

    createdAt: Date
    updatedAt: Date
  }

  type ClientPortalListResponse {
    list: [ClientPortal]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

export const inputs = `
  input OTPConfigInput {
    content: String
    codeLength: Int
    smsTransporterType: String
    loginWithOTP: Boolean
    expireAfter: Int
    emailSubject: String
  }

  input TwoFactorConfigInput {
    content: String
    codeLength: Int
    smsTransporterType: String
    enableTwoFactor: Boolean
    expireAfter: Int
    emailSubject: String
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
    publicKey: String
    certId: String
  }

  input TokiConfigInput {
    merchantId: String  
    apiKey: String
    username: String
    password: String
  }

  input ClientPortalConfigInput {
    name: String!
    description: String
    domain: String

    googleCredentials: JSON
    googleClientId: String
    googleClientSecret: String
    googleRedirectUri: String
    facebookAppId: String
    erxesAppToken: String
  
    otpConfig: OTPConfigInput
    twoFactorConfig: TwoFactorConfigInput

    mailConfig: MailConfig
    manualVerificationConfig: ManualVerificationConfigInput
    passwordVerificationConfig: PasswordVerificationConfigInput

    tokenExpiration: Int
    refreshTokenExpiration: Int
    tokenPassMethod: TokenPassMethod
    vendorParentProductCategoryId: String

    testUserEmail: String
    testUserPhone: String
    testUserPassword: String
    testUserOTP: String

    createdAt: Date
    updatedAt: Date
  }
`;

export const queries = `
  clientPortalGetConfig(_id: String!): ClientPortal
`;

export const mutations = `
  clientPortalConfigUpdate (
    config: ClientPortalConfigInput!
  ): ClientPortal

  clientPortalRemove (_id: String!): JSON
`;
