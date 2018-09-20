import { IUser } from "../auth/types";
import { ISegment } from "../segments/types";
import { IBrand } from "../settings/brands/types";
import { ITag } from "../tags/types";

export interface IEngageScheduleDate {
    type: string
    month: string
    day: string
    time: Date
}

export interface IEngageRule {
    _id: string
    text: string
    condition: string
    value: string
}

export interface IEngageMessenger {
    rules: IEngageRule[]
}

export interface IEngageStats {
    send: number,
    delivery: number,
    open: number,
    click: number,
    complaint: number,
    bounce: number,
    renderingfailure: number,
    reject: number
}

export interface IEngageMessage {
    _id: string
    kind: string
    segmentId: string
    customerIds: string[]
    title: string
    fromUserId: string
    method: string
    isDraft: boolean
    isLive: boolean
    stopDate: Date
    createdDate: Date
    type: string
    messengerReceivedCustomerIds: string[]
    tagIds: string[]
    stats: IEngageStats
    brand: IBrand
    email: JSON
    messenger: IEngageMessenger
    deliveryReports: JSON
    scheduleDate: IEngageScheduleDate
    segment: ISegment
    fromUser: IUser
    getTags: ITag[]
}