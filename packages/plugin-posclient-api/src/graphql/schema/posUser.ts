import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = `

  ${attachmentType}
  ${attachmentInput}
  
  type PosUserDetailsType {
    avatar: String
    fullName: String
    shortName: String
    birthDate: Date
    position: String
    workStartedDate: Date
    location: String
    description: String
    operatorPhone: String
  }

  type PosUser {
    _id: String!
    createdAt: Date
    username: String
    email: String
    isActive: Boolean
    isOwner: Boolean
    details: PosUserDetailsType
  }
`;

const commonSelector = `
  searchValue: String,
  isActive: Boolean,
`;

export const queries = `
  posUsers(page: Int, perPage: Int, status: String, ${commonSelector}): [PosUser]
  posUserDetail(_id: String): PosUser
  posCurrentUser: PosUser
`;

export const mutations = `
  posUsersCreateOwner(email: String!, password: String!, firstName: String!, lastName: String): String
  posLogin(email: String!, password: String! deviceToken: String): String
  posLogout: String
 `;
