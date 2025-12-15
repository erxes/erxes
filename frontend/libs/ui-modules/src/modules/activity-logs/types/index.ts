import React from 'react';

export interface TActivityEntity<TData = any> {
  moduleName: string;
  collectionName: string;
  text?: string;
  data?: TData;
}

export interface TActivityLog<TTarget = any, TContext = any> {
  _id: string;
  createdAt: string | Date;
  actorType: string;
  actor: {
    username?: string;
    email?: string;
    details?: {
      fullName?: string;
      avatar?: string;
    };
    [key: string]: any;
  };
  targetType: string;
  target: TActivityEntity<TTarget>;
  contextType: string;
  context: TActivityEntity<TContext>;
  action: {
    action: string;
    description: string;
  };
  changes?: any;
  metadata?: any;
  activityType: string;
}

export interface ActivityLogCustomActivity {
  type: string;
  render: (log: TActivityLog) => React.ReactNode;
}
