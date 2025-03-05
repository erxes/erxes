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

export interface IUserDetails {
  avatar: string
  fullName: string
  shortName: string
  position: string
  description: string
  firstName: string
  lastName: string
}

export interface IUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  details?: IUserDetails
  type: string
  companyName: string
  employeeId: string
}

export type QueryResponse = {
  loading: boolean
  refetch: (variables?: any) => Promise<any>
  error?: string
}

export type RemoveMutationResponse = {
  removeMutation: (params: {
    variables: { _id: string }
    refetchQueries?: any
  }) => Promise<any>
}
