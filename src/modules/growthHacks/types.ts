import { IUser } from 'modules/auth/types';
import { IItem, IItemParams } from 'modules/boards/types';
import { IField } from 'modules/settings/properties/types';
import { IActivityLogForMonth } from '../activityLogs/types';

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

export interface IGrowthHack extends IItem {
  hackStages?: string[];
  formId?: string;
  formSubmissions?: any;
  voteCount?: number;
  isVoted?: boolean;
  votedUsers?: IUser[];
  scoringType?: string;
  reach?: number;
  impact?: number;
  confidence?: number;
  formFields?: IField[];
  ease?: number;
}

export interface IGrowthHackParams extends IItemParams {
  hackStages?: string[];
  priority?: string;
  formId?: string;
  formSubmissions?: any;
  reach?: number;
  impact?: number;
  confidence?: number;
  ease?: number;
}

export interface IFormField {
  name: string;
  value: string;
}

// query types
export type GrowthHacksQueryResponse = {
  growthHacks: IGrowthHack[];
  loading: boolean;
  refetch: () => void;
};

// query types
export type GrowthHacksPriorityQueryResponse = {
  growthHacksPriorityMatrix: any[];
  loading: boolean;
  refetch: () => void;
};

export type GrowthHacksCountQueryResponse = {
  growthHacksTotalCount: number;
};

export type VoteVariables = {
  _id: string;
  isVote: boolean;
};

export type VoteMutation = ({ variables: VoteVariables }) => Promise<any>;
