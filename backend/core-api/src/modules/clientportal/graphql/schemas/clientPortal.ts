import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

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
    passwordVerificationConfig: PasswordVerificationConfig

    token: String
    refreshTokenExpiration: Int
    tokenPassMethod: TokenPassMethod
    vendorParentProductCategoryId: String

    testUserEmail: String
    testUserPhone: String
    testUserPassword: String
    testUserOTP: String

    socialpayConfig: SocialpayConfig
    tokiConfig: TokiConfig

    createdAt: Date
    updatedAt: Date
  }

  type ClientPortalListResponse {
    list: [ClientPortal]
    pageInfo: PageInfo
    totalCount: Int
  }

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
    name: String
    description: String
    domain: String

    googleCredentials: JSON
    googleClientId: String
    googleClientSecret: String
    googleRedirectUri: String
    facebookAppId: String
    token: String
  
    otpConfig: OTPConfigInput
    twoFactorConfig: TwoFactorConfigInput

    mailConfig: MailConfigInput
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
  }

  input IClientPortalFilter {
    _id: String
    ${GQL_CURSOR_PARAM_DEFS}
  } 

`;

export const queries = `
  getClientPortals(filter: IClientPortalFilter): ClientPortalListResponse
  getClientPortal(_id: String): ClientPortal
`;

export const mutations = `
  clientPortalAdd (
    name: String!
  ): ClientPortal
`;
