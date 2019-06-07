import {
  DealDetailQueryResponse,
  DealsQueryResponse,
  IDeal,
  IDealParams
} from 'modules/deals/types';
import { IUser } from '../auth/types';
import { ICompany } from '../companies/types';
import { ICustomer } from '../customers/types';

export interface IOptions {
  type: string;
  title: string;
  queriesName: { itemsQuery: string; detailQuery: string };
  mutationsName: {
    addMutation: string;
    editMutation: string;
    removeMutation: string;
    changeMutation: string;
    updateOrderMutation: string;
  };
  queries: { itemsQuery: string; detailQuery: string };
  mutations: {
    addMutation: string;
    editMutation: string;
    removeMutation: string;
    changeMutation: string;
    updateOrderMutation: string;
  };
  texts: {
    addText: string;
    addSuccessText: string;
    updateSuccessText: string;
    deleteSuccessText: string;
    copySuccessText: string;
  };
}

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
  itemsTotalCount: number;
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

export type Item = IDeal;

export interface IItemMap {
  [key: string]: Item[];
}

export type BoardsQueryResponse = {
  boards: IBoard[];
  loading: boolean;
};

export type PipelinesQueryResponse = {
  pipelines: IPipeline[];
  loading: boolean;
  refetch: ({ boardId }: { boardId?: string }) => Promise<any>;
};

export type StagesQueryResponse = {
  stages: IStage[];
  loading: boolean;
  refetch: ({ pipelineId }: { pipelineId?: string }) => Promise<any>;
};

export type DealsChangeMutation = (
  {
    variables: { _id }
  }
) => Promise<any>;

export type BoardsGetLastQueryResponse = {
  boardGetLast: IBoard;
  loading: boolean;
};

export type BoardDetailQueryResponse = {
  boardDetail: IBoard;
  loading: boolean;
};

export type PipelineDetailQueryResponse = {
  pipelineDetail: IPipeline;
  loading: boolean;
};

export type ItemsQueryResponse = DealsQueryResponse;

export type SaveMutation = ({ variables: ItemParams }) => Promise<any>;

export type RemoveVariables = {
  _id: string;
};

export type RemoveMutation = ({ variables: RemoveVariables }) => Promise<any>;

export type DetailQueryResponse = DealDetailQueryResponse;
