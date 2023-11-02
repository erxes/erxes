import { IUser } from "../auth/types"
import { IAttachment } from "../types"


export interface ISeenList {
  lastSeenMessageId: string
  user: IUser

}
export interface IChatMessage {
  _id: string
  content: string
  type: string
  attachments: IAttachment[]
  createdAt: string
  createdUser: IUser
  seenList: ISeenList[]
  relatedMessage: IChatMessage
  isPinned: boolean
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
