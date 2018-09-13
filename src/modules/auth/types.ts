export interface IUserDetails {
    avatar?: string;
    fullName?: string;
    description?: string;
    position?: string;
    location?: string;
}

export interface IUserLinks {
    facebook?: string,
    twitter?: string,
    linkedIn?: string,
    youtube?: string,
    github?: string,
    website?: string,
}

export interface IUser {
    _id: string;
    username: string;
    email: string;
    details?: IUserDetails;
    links?: IUserLinks
}