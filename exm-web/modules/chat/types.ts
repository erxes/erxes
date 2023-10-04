import { IUser } from "../auth/types"
import { IAttachment } from "../types"

export interface IChatMessage {
  _id: string
  content: string
  type: string
  attachments: IAttachment[]
  createdAt: string
  createdUser: IUser

  relatedMessage: IChatMessage
}

export interface IChat {
  _id: string
  name: string
  type: string
  isSeen: string
  featuredImage: any[]
  createdAt: string
  createdUser: IUser
  participantUsers: IUser[]
}
