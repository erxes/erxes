import { IUser } from "../auth/types"

export interface IBranch extends IStructureCommon {
  address: string
  parentId: string | null
  parent: IBranch
  order: string
  userIds: string[] | string
  userCount: number
  users: IUser[]
  radius: number
}
interface IStructureCommon {
  _id: string
  title: string
  code: string
  supervisorId: string
  supervisor: IUser
}

export interface IDepartment extends IStructureCommon {
  description: string
  parentId?: string | null
  order: string
  userIds: string[]
  userCount: number
  users: IUser
}

export interface IUnit extends IStructureCommon {
  departmentId: string
  department: IDepartment
  description: string
  userIds: string[]
  users: IUser
}

export type UnitsMainQueryResponse = {
  list: IUnit[]
  totalCount: number
}
export interface IAttachment {
  name: string
  type: string
  url: string
  size?: number
  duration?: number
}
export interface IEventData {
  where: string
  startDate: Date
  endDate: Date
  visibility: string
  goingUserIds: string[]
  interestedUserIds: string[]
}

export interface IFeed {
  _id: string
  title: string
  description?: string
  images?: IAttachment[]
  attachments?: IAttachment[]
  isPinned?: boolean
  contentType?: string
  recipientIds: string[]
  customFieldsData?: string
  ceremonyData?: string
  eventData?: IEventData
  startDate?: Date
  endDate?: Date
  createdBy?: string
  createdAt?: Date
  updatedBy?: string
  updatedAt?: Date
  department?: string
  departmentIds?: string[]
  branchIds?: string[]
  unitId?: string
  createdUser?: IUser
}

export interface IFeedVariable {
  title?: string
  description?: string
  images?: IAttachment[]
  attachments?: IAttachment[]
  isPinned?: boolean
  contentType?: string
  recipientIds?: string[]
  customFieldsData?: string
  ceremonyData?: string
  eventData?: any
  startDate?: Date
  endDate?: Date
  createdBy?: string
  createdAt?: Date
  updatedBy?: string
  updatedAt?: Date
  department?: string
  departmentIds?: string[]
  branchIds?: string[]
  unitId?: string
  createdUser?: IUser
}
