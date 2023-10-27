import { QueryResponse } from "../types"

interface IStructureCommon {
  _id: string
  title: string
  code: string
  supervisorId: string
  supervisor: IUser
}

export interface IOnboardingHistory {
  _id: string
  userId: string
  isCompleted?: boolean
  completedSteps: string[]
}

export interface IEmailSignature {
  brandId?: string
  signature?: string
}

export interface IUserDetailsC {
  avatar?: string
  fullName?: string
  shortName?: string
  description?: string
  birthDate?: Date
  position?: string
  workStartedDate?: Date
  location?: string
  operatorPhone?: string
  firstName?: string
  middleName?: string
  lastName?: string
}

export interface IUserLinksC {
  facebook?: string
  twitter?: string
  linkedIn?: string
  youtube?: string
  github?: string
  website?: string
}

export interface IUserConversationC {
  list: any[]
  totalCount: number
}

export interface IUserDocC {
  createdAt?: Date
  username: string
  email: string
  isActive?: boolean
  details?: IUserDetails
  isOwner?: boolean
  status?: string
  links?: IUserLinks
  getNotificationByEmail?: boolean
  participatedConversations?: IUserConversation[]
  permissionActions?: string[]
  configs?: any
  configsConstants?: any
  score?: number
  branchIds: string[]
  departmentIds: string[]
  employeeId?: string
}

export interface IBrand {
  _id: string
  code: string
  name?: string
  createdAt: string
  description?: string
  emailConfig: { type: string; template: string }
}

export interface IUserC extends IUserDoc {
  _id: string
  brands?: IBrand[]
  emailSignatures?: IEmailSignature[]
  onboardingHistory?: IOnboardingHistory
  branchIds: string[]
  departmentIds: string[]
  customFieldsData?: {
    [key: string]: any
  }
  isShowNotification?: boolean
  isSubscribed?: boolean
  details: any
}

export type AllUsersQueryResponse = {
  allUsers: IUser[]
} & QueryResponse

export type UsersQueryResponse = {
  users: IUser[]
} & QueryResponse

export type UserDetailQueryResponse = {
  userDetail: IUser
} & QueryResponse

export interface IDepartment extends IStructureCommon {
  description: string
  parentId?: string | null
  order: string
  userIds: string[]
  userCount: number
  users: IUser
}

export type IUser = IUserC & {
  isSubscribed?: boolean
  isAdmin?: boolean
  departments?: IDepartment[]
} & {
  isShowNotification?: boolean
} & {
  customFieldsData?: {
    [key: string]: any
  }
}
export type IUserDetails = IUserDetailsC
export type IUserLinks = IUserLinksC
export type IUserConversation = IUserConversationC
export type IUserDoc = IUserDocC

export interface IOwner {
  email: string
  password: string
  firstName: string
  lastName?: string
  purpose: string
  subscribeEmail?: boolean
}

export type ForgotPasswordMutationVariables = {
  email: string
  callback: (e: Error) => void
}

export type ForgotPasswordMutationResponse = {
  forgotPasswordMutation: (params: {
    variables: ForgotPasswordMutationVariables
  }) => Promise<any>
}

export type ResetPasswordMutationVariables = {
  newPassword: string
  token: string
}

export type ResetPasswordMutationResponse = {
  resetPasswordMutation: (params: {
    variables: ResetPasswordMutationVariables
  }) => Promise<any>
}

export type LoginMutationVariables = {
  email: string
  password: string
}

export type LoginMutationResponse = {
  loginMutation: (params: { variables: LoginMutationVariables }) => Promise<any>
}

export type CurrentUserQueryResponse = {
  currentUser: IUser
  loading: boolean
}

export type CreateOwnerMutationResponse = {
  createOwnerMutation: (params: { variables: IOwner }) => Promise<any>
}
