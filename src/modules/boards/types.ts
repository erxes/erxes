import { DealsQueryResponse, IDeal, IDealParams } from 'modules/deals/types';
import { IActivityLogForMonth } from '../activityLogs/types';
import { IUser } from '../auth/types';
import { ICompany } from '../companies/types';
import { ICustomer } from '../customers/types';

export interface IBoard {
  _id: string;
  name: string;
  pipelines?: IPipeline[];
}

export type ItemParams = IDealParams;

export type SaveItemMutation = ({ variables: ItemParams }) => Promise<any>;

export interface IPipeline {
  _id: string;
  name: string;
}

export interface IStage {
  _id: string;
  name?: string;
  type?: string;
  index?: number;
  itemId?: string;
  amount?: any;
  deals?: IDeal[];
  dealsTotalCount: number;
}

export interface IItem {
  _id: string;
  name: string;
  order: number;
  stageId: string;
  closeDate: Date;
  amount: number;
  modifiedAt: Date;
  assignedUsers: IUser[];
  companies: ICompany[];
  customers: ICustomer[];
  pipeline: IPipeline;
  stage?: IStage;
}

// example interface
export interface ITicket extends IItem {
  ticketType: string;
}

export interface IDraggableLocation {
  droppableId: string;
  index: number;
}

type Position = {
  _id?: string;
  droppableId?: string;
  index: number;
};

export interface IDragResult {
  type: string;
  destination: Position;
  source: Position;
  draggableId?: string;
  itemId?: string;
}

export interface IStageMap {
  [key: string]: IStage;
}

export type Item = IDeal | ITicket;

export interface IItemMap {
  [key: string]: Item[];
}

export type BoardsQueryResponse = {
  dealBoards: IBoard[];
  loading: boolean;
};

export type PipelinesQueryResponse = {
  dealPipelines: IPipeline[];
  loading: boolean;
  refetch: ({ boardId }: { boardId?: string }) => Promise<any>;
};

export type StagesQueryResponse = {
  dealStages: IStage[];
  loading: boolean;
  refetch: ({ pipelineId }: { pipelineId?: string }) => Promise<any>;
};

export type DealsChangeMutation = (
  {
    variables: { _id }
  }
) => Promise<any>;

export type BoardsGetLastQueryResponse = {
  dealBoardGetLast: IBoard;
  loading: boolean;
};

export type BoardDetailQueryResponse = {
  dealBoardDetail: IBoard;
  loading: boolean;
};

export type PipelineDetailQueryResponse = {
  dealPipelineDetail?: IPipeline;
  ticketPipelineDetail?: IPipeline;
  loading: boolean;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

export type ItemsQueryResponse = DealsQueryResponse;
