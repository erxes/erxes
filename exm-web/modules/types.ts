export interface IAttachment {
  name: string
  url: string
  size: number
  type: string
}

interface IAppearence {
  primaryColor: string
  secondaryColor: string
}

export interface IAnimatedLoader {
  height?: string
  width?: string
  color?: string
  round?: boolean
  margin?: string
  marginRight?: string
  isBox?: boolean
  withImage?: boolean
}

export interface IRouterProps {
  history: any
  location: any
  match: any
}

export interface IWelcomeContent {
  _id: string
  title: string
  image?: IAttachment
  content: string
}

export interface IBreadCrumbItem {
  title: string
  link?: string
}

interface IFeature {
  _id: string
  icon: string
  name: string
  description: string
  contentType: string
  contentId: string
  subContentId: string
}

export interface IUserDetails {
  avatar: string
  fullName: string
  shortName: string
  position: string
  description: string
}

export interface INotifcationSettings {
  receiveByEmail?: boolean
  receiveBySms?: boolean
}

export interface IUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  details?: IUserDetails
  type: string
  companyName: string

  notificationSettings?: INotifcationSettings
}

export interface IExm {
  _id: string
  name?: string
  description?: string
  features?: IFeature[]
  logo?: IAttachment
  appearance?: IAppearence
  welcomeContent?: IWelcomeContent[]
}

export type UserQueryResponse = {
  clientPortalCurrentUser: IUser
}

export type QueryResponse = {
  loading: boolean
  refetch: (variables?: any) => Promise<any>
  error?: string
}

export interface IComment {
  _id: string
  createdUser?: {
    _id?: string
    username?: string
    email?: string
    details: {
      avatar: string
      fullName: string
      position: string
    }
  }
  comment: string
  replies?: IComment[]
  contentId: string
}

export type RemoveMutationResponse = {
  removeMutation: (params: {
    variables: { _id: string }
    refetchQueries?: any
  }) => Promise<any>
}
