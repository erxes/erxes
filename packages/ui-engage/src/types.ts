import { IConditionsRule } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { IAttachment } from '@erxes/ui/src/types';
import { QueryResponse } from '@erxes/ui/src/types';
import { IBrand } from '@erxes/ui/src/brands/types';
import { ISegment, ISegmentCondition } from '@erxes/ui-segments/src/types';
import { ITag } from '@erxes/ui/src/tags/types';
import { IIntegration } from '@erxes/ui-settings/src/integrations/types';
import { MutationVariables } from '@erxes/ui/src/types';

export type IEngageScheduleDate = {
  type: string;
  month: string;
  day: string;
  dateTime: string;
} | null;

export interface IEngageMessenger {
  brandId: string;
  kind?: string;
  sentAs: string;
  content: string;
  rules?: IConditionsRule[];
}

export interface IEngageEmail {
  templateId?: string;
  subject: string;
  sender?: string;
  replyTo?: string;
  content: string;
  attachments?: IAttachment[];
}

export interface IEngageSms {
  from?: string;
  content: string;
  fromIntegrationId: string;
}

export interface IEngageStats {
  send: number;
  delivery: number;
  open: number;
  click: number;
  complaint: number;
  bounce: number;
  renderingfailure: number;
  reject: number;
  total: number;
}

export interface IEngageSmsStats {
  total: number;
  queued: number;
  sending: number;
  sent: number;
  delivered: number;
  sending_failed: number;
  delivery_failed: number;
  delivery_unconfirmed: number;
  webhook_delivered: number;
  error?: number;
}

export interface IEmailDelivery {
  _id: string;
  subject: string;
  body: string;
  to: string;
  cc: string;
  bcc: string;
  attachments: [JSON];
  from: string;
  kind: string;
  userId: string;
  customerId: string;

  status?: string;
  createdAt?: string;

  fromUser: IUser;
  fromEmail: string;
}

export interface IEmailTemplate {
  _id: string;
  name: string;
  content: string;
}

export interface IEngageMessageDoc {
  kind?: string;
  type?: string;
  segmentIds?: string[];
  tagIds?: string[];
  customerTagIds?: string[];
  brandIds?: string[];
  customerIds?: string[];
  title: string;
  fromUserId?: string;
  method: string;
  isDraft?: boolean;
  isLive?: boolean;
  email?: IEngageEmail;
  messenger?: IEngageMessenger;
  scheduleDate?: IEngageScheduleDate;
  shortMessage?: IEngageSms;
}

export interface IEngageMessage extends IEngageMessageDoc {
  _id: string;
  stopDate: Date;
  createdDate: Date;
  messengerReceivedCustomerIds?: string[];
  brand: IBrand;
  segments: ISegment[];
  fromUser: IUser;
  tagIds: string[];
  customerTags: ITag[];
  getTags: ITag[];
  totalCustomersCount?: number;
  validCustomersCount?: number;
  runCount?: number;
  lastRunAt?: Date;

  stats?: IEngageStats;
  logs?: Array<{ message: string }>;
  smsStats?: IEngageSmsStats;
  fromIntegration?: IIntegration;
  createdUserName?: string;
}

// mutation types
export type RemoveMutationResponse = {
  removeMutation: (params: { variables: MutationVariables }) => Promise<void>;
};

export type SetPauseMutationResponse = {
  setPauseMutation: (params: { variables: MutationVariables }) => Promise<void>;
};

export type SetLiveMutationResponse = {
  setLiveMutation: (params: { variables: MutationVariables }) => Promise<void>;
};

export type SetLiveManualMutationResponse = {
  setLiveManualMutation: (params: {
    variables: MutationVariables;
  }) => Promise<void>;
};

export type WithFormMutationVariables = {
  name: string;
  description: string;
  subOf: string;
  color: string;
  connector: string;
  conditions: ISegmentCondition[];
};

export type WithFormAddMutationResponse = {
  addMutation: (params: {
    variables: WithFormMutationVariables;
  }) => Promise<any>;
};

export type WithFormEditMutationResponse = {
  editMutation: (params: {
    variables: WithFormMutationVariables;
  }) => Promise<any>;
};

// query types
export type EngageMessageDetailQueryResponse = {
  engageMessageDetail: IEngageMessage;
  error: Error;
  loading: boolean;
};

export type EngageVerifiedEmailsQueryResponse = {
  engageVerifiedEmails: string[];
  error: Error;
} & QueryResponse;

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  kind?: string;
  status?: string;
  tag?: string;
  ids?: string[];
};

export type EngageMessagesQueryResponse = {
  engageMessages: IEngageMessage[];
} & QueryResponse;

export type EngageMessagesTotalCountQueryResponse = {
  engageMessagesTotalCount: number;
} & QueryResponse;

export type EmailTemplatesTotalCountQueryResponse = {
  emailTemplatesTotalCount: number;
};

export type EmailTemplatesQueryResponse = {
  fetchMore: (params: {
    variables: { page: number };
    updateQuery: (prev: any, fetchMoreResult: any) => void;
  }) => void;
  emailTemplates: IEmailTemplate[];
  variables: { [key: string]: string | number };
  loading: boolean;
  refetch: () => void;
};

export type EngageMessageCounts = {
  all: number;
  auto: number;
  manual: number;
  visitorAuto: number;
};

export type CountQueryResponse = {
  engageMessageCounts: EngageMessageCounts;
};

export type AddMutationResponse = {
  messagesAddMutation: (params: {
    variables: IEngageMessageDoc;
  }) => Promise<any>;
};

export type TagAdd = (params: {
  doc: { name: string; description: string };
}) => void;

export type IEmailFormProps = {
  onChange: (
    name: 'email' | 'content' | 'fromUserId' | 'scheduleDate',
    value?: IEngageEmail | IEngageScheduleDate | string
  ) => void;
  message?: string;
  users: IUser[];
  templates: IEmailTemplate[];
  kind: string;
  email: IEngageEmail;
  fromUserId: string;
  content: string;
  scheduleDate: IEngageScheduleDate;
  isSaved?: boolean;
};

export type EngageConfigQueryResponse = {
  engagesConfigDetail: Array<{ code: string; value: string }>;
} & QueryResponse;

export interface IIntegrationWithPhone {
  _id: string;
  name: string;
  phoneNumber: string;
  isActive: boolean;
}

export type CopyMutationResponse = {
  copyMutation: (params: { variables: MutationVariables }) => Promise<void>;
};

export interface IEngageLog {
  _id: string;
  createdAt: Date;
  engageMessageId: string;
  message: string;
  type: string;
}

export type EngageLogsQueryResponse = {
  engageLogs: IEngageLog[];
  fetchMore: any;
} & QueryResponse;
