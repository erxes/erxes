import {
  attachmentInput,
  attachmentType,
  pdfAttachmentType,
  pdfAttachmentInput
} from "@erxes/api-utils/src/commonTypeDefs";

export const types = enabledPlugins => `
${attachmentType}
${attachmentInput}
${pdfAttachmentType}
${pdfAttachmentInput}

  extend type Customer @key(fields: "_id") {
    _id: String! @external
  }

  extend type Company @key(fields: "_id") {
    _id: String! @external
  }


type VerificationRequest {
  status: String
  attachments: [Attachment]
  description: String
  verifiedBy: String
}
type TwoFactorDevice {
  key: String
  device: String
  date: Date
  
}
  input ClientPortalUserUpdate {
    firstName: String
    lastName: String
    phone: String
    email: String
    username: String
    companyName: String
    companyRegistrationNumber: String
    code: String,
    links: JSON,
    customFieldsData: JSON,
    isEmailVerified: Boolean
    isPhoneVerified: Boolean
    isOnline: Boolean
    avatar: String
  }
  input TwoFactor {
    key: String
    device: String
  }
  type ClientPortalUser @key(fields: "_id") {
    _id: String!
    createdAt: Date
    modifiedAt: Date
    fullName: String
    firstName: String
    lastName: String
    phone: String
    email: String
    username: String
    type: String
    companyName: String
    companyRegistrationNumber: String
    erxesCustomerId: String
    erxesCompanyId: String
    clientPortalId: String
    code: String,
    ownerId: String,
    links: JSON,
    customFieldsData: JSON,
    customFieldsDataByFieldCode: JSON,
    password: String
    isEmailVerified: Boolean
    isPhoneVerified: Boolean

    isOnline: Boolean
    lastSeenAt: Date
    sessionCount: Int

    clientPortal: ClientPortal

    notificationSettings: UserNotificationSettings

    avatar: String

    verificationRequest: VerificationRequest


        customer: Customer
        company: Company

    twoFactorDevices:[TwoFactorDevice]
  }

  type clientPortalUsersListResponse {
    list: [ClientPortalUser],
    totalCount: Float,
  }

  type ClientPortalCompany {
    _id: String!
    erxesCompanyId: String

    productCategoryIds: [String]
    clientPortalId: String
    createdAt: Date
    company: Company
  }

  enum ClientPortalUserVerificationStatus {
    verified
    notVerified
    pending
  }

  type CPAuthPayload {
    token: String
    refreshToken: String
  }

   enum PostAuthorKind {
        user
        clientPortalUser
    }

  input PostDocumentInput {
        clientPortalId: String
        title: String
        slug: String
        content: String
        excerpt: String
        categoryIds: [String]
        featured: Boolean
        status: String
        tagIds: [String]
        authorId: String
        scheduledDate: Date
        autoArchiveDate: Date
        reactions: [String]
        reactionCounts: JSON
        thumbnail: AttachmentInput
        images: [AttachmentInput]
        video: AttachmentInput
        audio: AttachmentInput
        documents: [AttachmentInput]
        attachments: [AttachmentInput]
        pdfAttachment: PdfAttachmentInput
        videoUrl: String
        customFieldsData: JSON
    }
${
  enabledPlugins.cms
    ? `type ClientportalUserPostList {
        posts: [Post]
        totalCount: Int
        totalPages: Int
        currentPage: Int
    }`
    : ``
}
    
`;

export const conformityQueryFields = `
  conformityMainType: String
  conformityMainTypeId: String
  conformityRelType: String
  conformityIsRelated: Boolean
  conformityIsSaved: Boolean
`;

const queryParams = `
  page: Int
  perPage: Int
  type: String
  ids: [String]
  excludeIds: Boolean
  searchValue: String
  sortField: String
  sortDirection: Int
  cpId: String
  dateFilters: String
  ${conformityQueryFields}
`;

export const queries = cmsAvailable => `
  clientPortalCurrentUser: ClientPortalUser
  clientPortalUserDetail(_id: String!): ClientPortalUser
  clientPortalUsers(${queryParams}): [ClientPortalUser]
  clientPortalUsersMain(${queryParams}): clientPortalUsersListResponse
  clientPortalUserCounts(type: String): Int

  clientPortalCompanies(clientPortalId: String!): [ClientPortalCompany]

    ${
      cmsAvailable
        ? `
  clientPortalUserPosts(searchValue: String, page: Int, perPage: Int): ClientportalUserPostList
    `
        : ""
    }  
`;

const userParams = `
  phone: String,
  email: String,
  username: String,
  password: String,
  secondaryPassword: String,

  companyName: String
  companyRegistrationNumber: String
  erxesCompanyId: String
  
  firstName: String,
  lastName: String,
  code: String,
  ownerId: String,
  links: JSON,
  customFieldsData: JSON,
  
  type: String,
  avatar: String
`;

export const inputs = `
    input ClientPortalUserInput {
        ${userParams}
    }
`


export const mutations = cmsAvailable => `
  clientPortalUsersInvite(${userParams}, disableVerificationMail: Boolean,  clientPortalId: String): ClientPortalUser
  clientPortalUsersEdit(_id: String!,  clientPortalId: String, ${userParams}): ClientPortalUser
  clientPortalUserEditProfile(input: ClientPortalUserInput): ClientPortalUser
  clientPortalUsersRemove(clientPortalUserIds: [String!]): JSON
  clientPortalRegister(${userParams}, clientPortalId: String): String
  clientPortalVerifyOTP(userId: String!, phoneOtp: String, emailOtp: String, password: String): JSON
  clientPortalUsersVerify(userIds: [String]!, type: String): JSON
  clientPortalLogin(login: String!, password: String!, clientPortalId: String!, deviceToken: String,twoFactor: TwoFactor): JSON
  clientPortalLoginWithPhone(phone: String!, clientPortalId: String!, deviceToken: String): JSON
  clientPortal2FAGetCode(byPhone: Boolean,byEmail:Boolean): JSON
  clientPortal2FADeleteKey(key:String!): JSON
  clientPortalVerify2FA(phoneOtp: String, emailOtp: String,twoFactor:TwoFactor): JSON
  clientPortalLoginWithMailOTP(email: String!, clientPortalId: String!, deviceToken: String): JSON
  clientPortalLoginWithSocialPay(clientPortalId: String!, token: String!) : JSON
  clientPortalLoginWithToki(clientPortalId: String!, token: String!) : JSON
  clientPortalRefreshToken: String
  clientPortalGoogleAuthentication(clientPortalId: String!, code: String!): JSON
  clientPortalFacebookAuthentication(accessToken: String!, clientPortalId: String!): JSON
  clientPortalLogout: String
  
  clientPortalUsersReplacePhone(clientPortalId: String!, phone: String!): String!
  clientPortalUsersVerifyPhone(code: String!): String!
  clientPortalUsersMove(oldClientPortalId: String!, newClientPortalId: String!): JSON

  clientPortalUserAssignCompany(userId: String!, erxesCompanyId: String!, erxesCustomerId: String!):  JSON

  clientPortalConfirmInvitation(token: String, password: String, passwordConfirmation: String, username: String): ClientPortalUser
  clientPortalForgotPassword(clientPortalId: String!, email: String, phone: String): String!
  clientPortalResetPasswordWithCode(phone: String!, code: String!, password: String!,isSecondary:Boolean): String
  clientPortalResetPassword(token: String!, newPassword: String!): JSON
  clientPortalUserChangePassword(currentPassword: String!, newPassword: String!): ClientPortalUser
  clientPortalUsersSendVerificationRequest(login: String!, password: String!, clientPortalId: String!,  attachments: [AttachmentInput]!, description: String): String
  clientPortalUsersChangeVerificationStatus(userId: String!, status: ClientPortalUserVerificationStatus!): String
  clientPortalUpdateUser(_id: String!, doc: ClientPortalUserUpdate!): JSON

  clientPortalUserSetSecondaryPassword(newPassword: String!, oldPassword:String): String

  ${
    cmsAvailable
      ? `
  clientPortalUserAddPost(input: PostDocumentInput!): Post
  clientPortalUserEditPost(_id: String!, input: PostDocumentInput!): Post
  clientPortalUserRemovePost(_id: String!): JSON
  clientPortalUserChangeStatus(_id: String!, status: String!): Post
  clientPortalUserToggleFeatured(_id: String!): Post
    `
      : ""
  }
  
`;
