export interface IUserDetails {
  avatar?: string;
  fullName?: string;
  description?: string;
  position?: string;
  location?: string;
}

export interface IUserLinks {
  facebook?: string;
  twitter?: string;
  linkedIn?: string;
  youtube?: string;
  github?: string;
  website?: string;
}

export interface IUserConversation {
  list: any[];
  totalCount: number;
}

export interface IUserDoc {
  username: string;
  email: string;
  role?: string;
  details?: IUserDetails;
  links?: IUserLinks;
  getNotificationByEmail?: boolean;
  participatedConversations?: IUserConversation[];
}

export interface IUser extends IUserDoc {
  _id: string;
  role: string;
}
