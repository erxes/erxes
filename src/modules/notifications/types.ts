import { IUser } from 'modules/auth/types';

export interface INotification {
  _id: string;
  notifType: string;
  title: string;
  link: string;
  content: string;
  createdUser: IUser;
  receiver: string;
  date: Date;
  isRead: boolean;
}
