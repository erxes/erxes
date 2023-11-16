import { IUser } from "../auth/types"

export interface INotification {
  _id:string
  notifType:string
  title:string
  link:string
  content:string
  action:string
  createdUser: IUser
  receiver:string
  date:Date
  isRead:boolean
}