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

export interface IUsers {
    _id: string;
    username: string;
    details: IUserDetails;
}