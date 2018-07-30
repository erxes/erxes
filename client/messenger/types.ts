export interface IUserDetails {
    avatar: string,
    fullName: string,
}

export interface IUser {
    _id: string,
    details?: IUserDetails,
}

export interface IEngageData {
    content: string,
    kind: string,
    sentAs: string,
    fromUser: IUser,
    messageId: string,
    brandId: string,
}

export interface IAttachment {
    name: string,
    url: string,
}

export interface IMessage {
    _id: string,
    conversationId: string,
    user?: IUser,
    content: string,
    createdAt: Date,
    internal?: boolean,
    engageData: IEngageData
    attachments: IAttachment[]
}

export interface IConversation {
    _id: string,
    content: string,
    createdAt: Date,
    participatedUsers?: IUser[],
    messages: IMessage[],
    isOnline: boolean,
    supporters?: IUser[]
}