import { IDeal } from '@erxes/ui-cards/src/deals/types';
import { IUser } from '@erxes/ui/src/auth/types';

export interface IMeeting {
  _id: string;
  title: string;
  description: string;

  startDate: Date;
  endDate: Date;
  location: string;
  method: string;

  createdBy: string;
  createdAt: Date;

  status: string;

  companyId: string;

  participantIds: string[];
  participantUser: IUser[];
  createdUser: IUser;

  topics: ITopic[];
  dealIds: string[];
  deals?: any;
}

// queries
export type MeetingsQueryResponse = {
  meetings: IMeeting[];
  refetch: () => void;
  loading: boolean;
};

// queries
export type MeetingDetailQueryResponse = {
  meetingDetail: IMeeting;
  refetch: () => void;
  loading: boolean;
};

// mutations
export type MutationVariables = {
  _id?: string;
  name: string;
  createdAt?: Date;
  expiryDate?: Date;
  checked?: boolean;
  type?: string;
};
export type AddMutationResponse = {
  addMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

export type EditMutationResponse = {
  editMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};

export interface ITopic {
  _id: string;
  title: string;
  description: string;
  ownerId: string;
}
