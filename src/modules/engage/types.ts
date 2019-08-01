import { IConditionsRule } from 'modules/common/types';
import { IUser } from '../auth/types';
import { IAttachment } from '../common/types';
import { ISegment, ISegmentCondition, ISegmentDoc } from '../segments/types';
import { IBrand } from '../settings/brands/types';
import { ITag } from '../tags/types';

export interface IEngageScheduleDate {
  type: string;
  month: string;
  day: string;
  time: Date;
}

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
  content: string;
  attachments?: IAttachment[];
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

export interface IEngageMessageDoc {
  kind?: string;
  type?: string;
  segmentIds?: string[];
  tagIds?: string[];
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
}

export interface IEngageMessage extends IEngageMessageDoc {
  _id: string;
  stopDate: Date;
  createdDate: Date;
  messengerReceivedCustomerIds?: string[];
  deliveryReports?: JSON;
  stats?: IEngageStats;
  brand: IBrand;
  segment: ISegment;
  fromUser: IUser;
  tagIds: string[];
  getTags: ITag[];
}

// mutation types

export type MutationVariables = {
  _id: string;
};

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
  setLiveManualMutation: (
    params: { vairables: MutationVariables }
  ) => Promise<void>;
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
  addMutation: (
    params: {
      variables: WithFormMutationVariables;
    }
  ) => Promise<any>;
};

export type WithFormEditMutationResponse = {
  editMutation: (
    params: {
      vairables: WithFormMutationVariables;
    }
  ) => Promise<any>;
};

// query types

export type EngageMessageDetailQueryResponse = {
  engageMessageDetail: IEngageMessage;
  loading: boolean;
};

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
  loading: boolean;
  refetch: () => void;
};

export type EngageMessagesTotalCountQueryResponse = {
  engageMessagesTotalCount: number;
  loading: boolean;
  refetch: () => void;
};

export type EngageMessageCounts = {
  all: number;
  auto: number;
  manual: number;
  visitoryAuto: number;
};

export type TagCountQueryResponse = {
  [key: string]: number;
};

export type CountQueryResponse = {
  engageMessageCounts: EngageMessageCounts;
};

export type AddMutationResponse = {
  messagesAddMutation: (
    params: { variables: IEngageMessageDoc }
  ) => Promise<any>;
};

export type TagAdd = (
  params: { doc: { name: string; description: string } }
) => void;
export type SegmentAdd = (params: { doc: ISegmentDoc }) => void;

export type TargetCount = {
  [key: string]: number;
};
