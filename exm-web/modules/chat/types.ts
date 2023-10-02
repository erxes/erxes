import { IUser } from "../auth/types"

export interface IChatMessage {
  _id: string
  content: string
  type: string
  attachments: string
  createdAt: string
  createdUser: IUser

  relatedMessage: IChatMessage
}

export interface IChat {
  _id: string
  name: string
  type: string
  isSeen: string
  featuredImage: string
  createdAt: string
  createdUser: IUser
  participantUsers: IUser[]
}
