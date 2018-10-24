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

export type NotificationsQueryResponse = {
  notifications: INotification[];
  loading: boolean;
  refetch: () => void;
};

export type MarkAsReadMutationResponse = {
  notificationsMarkAsReadMutation: (
    params: { variables: { _ids: string[] } }
  ) => Promise<any>;
};

export type NotificationsCountQueryResponse = {
  notificationCounts: number;
  loading: boolean;
  refetch: () => void;
};
