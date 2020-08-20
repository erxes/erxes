import { IAttachment } from 'modules/common/types';
import { ISavedConformity } from 'modules/conformity/types';
import { IUser } from '../auth/types';
import { ICompany } from '../companies/types';
import { ICustomer } from '../customers/types';

export interface IOptions {
  EditForm: any;
  Item: any;
  type: string;
  title: string;
  queriesName: {
    itemsQuery: string;
    detailQuery: string;
    archivedItemsQuery: string;
    archivedItemsCountQuery: string;
  };
  mutationsName: {
    addMutation: string;
    editMutation: string;
    removeMutation: string;
    changeMutation: string;
    watchMutation: string;
    copyMutation: string;
    archiveMutation: string;
  };
  queries: {
    itemsQuery: string;
    detailQuery: string;
    archivedItemsQuery: string;
    archivedItemsCountQuery: string;
  };
  mutations: {
    addMutation: string;
    editMutation: string;
    removeMutation: string;
    changeMutation: string;
    watchMutation: string;
    archiveMutation: string;
    copyMutation: string;
  };
  texts: {
    addText: string;
    addSuccessText?: string;
    updateSuccessText: string;
    deleteSuccessText: string;
    copySuccessText: string;
    changeSuccessText: string;
  };
  isMove: boolean;
  getExtraParams: (queryParams: any) => any;
}

export interface IBoard {
  _id: string;
  name: string;
  pipelines?: IPipeline[];
}

export interface IItemParams {
  _id?: string;
  name?: string;
  stageId?: string;
  assignedUserIds?: string[];
  closeDate?: Date;
  description?: string;
  order?: number;
  isComplete?: boolean;
  priority?: string;
  reminderMinute?: number;
  companyIds?: string[];
  customerIds?: string[];
  sourceConversationId?: string;
  labelIds?: string[];
  proccessId?: string;
  aboveItemId?: string;
  attachments?: string[];
}

export type SaveItemMutation = ({ variables: IItemParams }) => Promise<any>;
export type RemoveStageMutation = (
  { variables }: { variables: { _id: string } }
) => Promise<any>;

export interface IPipeline {
  _id: string;
  name: string;
  boardId: string;
  visibility: string;
  members?: IUser[];
  memberIds?: string[];
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
}

interface IStageComparisonInfo {
  count: number;
  percent: number;
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

export interface IConversionStage extends IStage {
  initialDealsTotalCount: number;
  inProcessDealsTotalCount: number;
  stayedDealsTotalCount: number;
  compareNextStage: IStageComparisonInfo;
}

export interface IPipelineLabel {
  _id?: string;
  name: string;
  colorCode: string;
  pipelineId?: string;
  createdBy?: string;
  createdAt?: Date;
}

export interface IPipelineLabelVariables {
  name: string;
  colorCode: string;
  pipelineId: string;
}
export interface IItem {
  _id: string;
  name: string;
  order: number;
  stageId: string;
  boardId?: string;
  closeDate: Date;
  description: string;
  amount: number;
  modifiedAt: Date;
  assignedUserIds?: string[];
  assignedUsers: IUser[];
  createdUser?: IUser;
  companies: ICompany[];
  customers: ICustomer[];
  attachments?: IAttachment[];
  labels: IPipelineLabel[];
  pipeline: IPipeline;
  stage?: IStage;
  isWatched?: boolean;
  priority?: string;
  hasNotified?: boolean;
  isComplete: boolean;
  reminderMinute: number;
  labelIds: string[];
  status?: string;
  createdAt: Date;
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

export interface IItemMap {
  [key: string]: IItem[];
}

export type BoardsQueryResponse = {
  boards: IBoard[];
  loading: boolean;
  refetch: () => void;
};

export interface IBoardCount {
  _id: string;
  name: string;
  count: number;
}

export type BoardCountsQueryResponse = {
  boardCounts: IBoardCount[];
  loading: boolean;
  refetch: () => void;
};

export type PipelinesQueryResponse = {
  pipelines: IPipeline[];
  loading: boolean;
  refetch: (
    { boardId, type }: { boardId?: string; type?: string }
  ) => Promise<any>;
};

export type StagesQueryResponse = {
  stages: IStage[];
  loading: boolean;
  refetch: ({ pipelineId }: { pipelineId?: string }) => Promise<any>;
};

export type ConversionStagesQueryResponse = {
  stages: IConversionStage[];
  loading: boolean;
  refetch: ({ pipelineId }: { pipelineId?: string }) => Promise<any>;
};

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
  subscribeToMore: any;
};

export type WatchVariables = {
  _id: string;
  isAdd: boolean;
  type?: string;
};

export type SaveMutation = ({ variables: IItemParams }) => Promise<any>;

export type WatchMutation = ({ variables: WatchVariables }) => Promise<any>;

export type RemoveVariables = {
  _id: string;
};

export type RemoveMutation = ({ variables: RemoveVariables }) => Promise<any>;

export type CopyVariables = {
  _id: string;
  proccessId: string;
};

export type CopyMutation = ({ variables: CopyVariables }) => Promise<any>;

export type ItemsQueryResponse = {
  loading: boolean;
  refetch: () => void;
  fetchMore: any;
};

export type RelatedItemsQueryResponse = {
  loading: boolean;
  refetch: () => void;
  fetchMore: any;
};

export type DetailQueryResponse = {
  loading: boolean;
  error?: Error;
  subscribeToMore: any;
  refetch: () => void;
};

// query response
export type PipelineLabelsQueryResponse = {
  pipelineLabels: IPipelineLabel[];
  loading: boolean;
  refetch: () => void;
};

export type PipelineLabelDetailQueryResponse = {
  pipelineLabelDetail: IPipelineLabel;
  loading: boolean;
  refetch: () => void;
};

// mutation response
export type AddPipelineLabelMutationResponse = (
  { variables: IPipelineLabelVariables }
) => Promise<any>;

export type EditPipelineLabelMutationResponse = (
  { variables: EditMutationVariables }
) => Promise<any>;

export type RemovePipelineLabelMutationVariables = {
  _id: string;
};

export type RemovePipelineLabelMutationResponse = {
  removeMutation: (
    params: {
      variables: RemovePipelineLabelMutationVariables;
    }
  ) => Promise<void>;
};

export type PipelineLabelMutationVariables = {
  pipelineId: string;
  targetId: string;
  labelIds: string[];
};

export type PipelineLabelMutationResponse = {
  pipelineLabelMutation: (
    params: {
      variables: PipelineLabelMutationVariables;
    }
  ) => Promise<any>;
};

export interface IFilterParams extends ISavedConformity {
  itemId?: string;
  search?: string;
  stageId?: string;
  customerIds?: string;
  companyIds?: string;
  assignedUserIds?: string;
  closeDateType?: string;
  labelIds?: string;
  userIds?: string;
}

export interface INonFilterParams {
  key?: string;
  pipelineId: string;
  id: string;
}

export interface IEditFormContent {
  state: any;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  onChangeStage: (stageId: string) => void;
  copy: () => void;
  remove: (id: string) => void;
}
