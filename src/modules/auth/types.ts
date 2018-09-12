export interface IUserDetails {
    avatar: string;
    fullName: string;
}

export interface IUser {
    _id: string;
    username: string;
    details: IUserDetails;
}