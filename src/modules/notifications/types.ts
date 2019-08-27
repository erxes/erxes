import { IUser } from 'modules/auth/types';

export interface INotification {
  _id: string;
  notifType: string;
  title: string;
  link: string;
  content: string;
  action: string;
  createdUser: IUser;
  receiver: string;
  date: Date;
  isRead: boolean;
}

export type NotificationsQueryResponse = {
  notifications: INotification[];
  subscribeToMore: any;
  loading: boolean;
  refetch: () => void;
};

export type MarkAsReadMutationResponse = {
  notificationsMarkAsReadMutation: (
    params: { variables: { _ids?: string[] } }
  ) => Promise<any>;
};

export type NotificationsCountQueryResponse = {
  notificationCounts: number;
  loading: boolean;
  subscribeToMore: (
    params: {
      document: string;
      updateQuery: () => void;
      variables: { userId: string | null };
    }
  ) => void;
  refetch: () => void;
};

export type NotificationModuleType = {
  name: string;
  text: string;
};

export type NotificationModule = {
  name: string;
  description: string;
  types: NotificationModuleType[];
};

export type NotificationModulesQueryResponse = {
  notificationsModules: NotificationModule[];
  loading: boolean;
  refetch: () => void;
};

export type NotificationConfig = {
  _id: string;
  user: string;
  notifType: string;
  isAllowed: boolean;
};

export type NotificationConfigsQueryResponse = {
  notificationsGetConfigurations: NotificationConfig[];
  loading: boolean;
  refetch: () => void;
};

// mutation types

export type GetNotificationByEmailMutationVariables = {
  byEmail: { isAllowed: boolean };
};

export type GetNotificationByEmailMutationResponse = {
  configGetNotificationByEmailMutation: (
    { variables: GetNotificationByEmailMutationVariables }
  ) => Promise<any>;
};

export type SaveNotificationConfigMutationVariables = {
  notify: { notifType: string; isAllowed: boolean };
};

export type SaveNotificationConfigMutationResponse = {
  saveNotificationConfigurationsMutation: (
    { variables: SaveNotificationConfigMutationVariables }
  ) => Promise<any>;
};
