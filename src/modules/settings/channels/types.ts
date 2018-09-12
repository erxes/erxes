export interface IChannel {
    _id: string;
    name: string;
    description?: string;
    integrationIds: string[];
    memberIds: string[];
}

export interface IUserDetails {
    avatar: string;
    fullName: string;
}

export interface IUser {
    _id: string;
    username: string;
    details: IUserDetails;
}