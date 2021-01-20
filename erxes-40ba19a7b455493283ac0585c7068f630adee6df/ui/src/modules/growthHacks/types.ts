import { IUser } from 'modules/auth/types';
import { IItem, IItemParams } from 'modules/boards/types';
import { QueryResponse } from 'modules/common/types';
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
} & QueryResponse;

// query types
export type GrowthHacksPriorityQueryResponse = {
  growthHacksPriorityMatrix: any[];
} & QueryResponse;

export type StateCountsQueryResponse = {
  pipelineStateCount: any;
} & QueryResponse;

export type GrowthHacksCountQueryResponse = {
  growthHacksTotalCount: number;
};

export type VoteVariables = {
  _id: string;
  isVote: boolean;
};

export type VoteMutation = ({ variables: VoteVariables }) => Promise<any>;

export type GrowthHackFieldName =
  | 'hackStages'
  | 'formId'
  | 'formSubmissions'
  | 'voteCount'
  | 'isVoted'
  | 'votedUsers'
  | 'scoringType'
  | 'reach'
  | 'impact'
  | 'confidence'
  | 'formFields'
  | 'ease'
  | 'priority'
  | 'stageId';
