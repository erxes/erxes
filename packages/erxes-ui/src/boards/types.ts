import { IUser } from 'auth/types';
import { QueryResponse } from '../types';

export interface IBoard {
  _id: string;
  name: string;
  pipelines?: IPipeline[];
}

export interface IPipeline {
  _id: string;
  name: string;
  boardId: string;
  visibility: string;
  status: string;
  createdAt: Date;
  createdUser: IUser;
  members?: any[];
  memberIds?: string[];
  condition?: string;
  label?: string;
  bgColor?: string;
  isWatched: boolean;
  startDate?: Date;
  endDate?: Date;
  metric?: string;
  hackScoringType?: string;
  templateId?: string;
  state?: string;
  itemsTotalCount?: number;
  isCheckUser?: boolean;
  excludeCheckUserIds?: string[];
  numberConfig?: string;
  numberSize?: string;
}

export interface IStage {
  _id: string;
  name: string;
  type: string;
  probability: string;
  index?: number;
  itemId?: string;
  amount?: any;
  itemsTotalCount: number;
  formId: string;
  pipelineId: string;
  status: string;
  order: number;
}

export type BoardsQueryResponse = {
  boards: IBoard[];
} & QueryResponse;

export type PipelinesQueryResponse = {
  pipelines: IPipeline[];
  loading: boolean;
  refetch: ({
    boardId,
    type,
  }: {
    boardId?: string;
    type?: string;
  }) => Promise<any>;
};

export type StagesQueryResponse = {
  stages: IStage[];
  loading: boolean;
  refetch: ({ pipelineId }: { pipelineId?: string }) => Promise<any>;
};

export type TicketCommentAddMutationVariables = {
  ticketId: string;
  content: string;
  userId: string;
};

export type TicketCommentAddMutationResponse = {
  ticketCommentAdd: (params: {
    variables: TicketCommentAddMutationVariables;
  }) => Promise<any>;
};
