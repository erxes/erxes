import {
  BoardsQueryResponse as BoardsQueryResponseC,
  IBoard as IBoardC,
  IPipeline as IPipelineC,
  IStage as IStageC,
  PipelinesQueryResponse as PipelinesQueryResponseC,
  StagesQueryResponse as StagesQueryResponseC
} from 'erxes-ui/lib/boards/types';
import { IAttachment, QueryResponse } from 'modules/common/types';
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
    updateTimeTrackMutation?: string;
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

export type IBoard = IBoardC;

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
  sourceConversationIds?: string[];
  labelIds?: string[];
  proccessId?: string;
  aboveItemId?: string;
  attachments?: string[];
}

export type SaveItemMutation = ({ variables: IItemParams }) => Promise<any>;
export type RemoveStageMutation = ({
  variables
}: {
  variables: { _id: string };
}) => Promise<any>;

export type IPipeline = IPipelineC;

interface IStageComparisonInfo {
  count: number;
  percent: number;
}

export type IStage = IStageC;

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
  timeTrack: {
    status: string;
    timeSpent: number;
    startDate?: string;
  };
  customFieldsData?: {
    [key: string]: any;
  };
  score?: number;
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

export type BoardsQueryResponse = BoardsQueryResponseC;

export interface IBoardCount {
  _id: string;
  name: string;
  count: number;
}

export type BoardCountsQueryResponse = {
  boardCounts: IBoardCount[];
} & QueryResponse;

export type PipelinesQueryResponse = PipelinesQueryResponseC;

export type StagesQueryResponse = StagesQueryResponseC;

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

export type UpdateTimeVariables = {
  _id: string;
  status: string;
  timeSpent: number;
  startDate?: string;
};

export type RemoveMutation = ({ variables: RemoveVariables }) => Promise<any>;

export type UpdateTimeTrackMutation = ({
  variables: UpdateTimeVariables
}) => Promise<any>;

export type CopyVariables = {
  _id: string;
  proccessId: string;
};

export type CopyMutation = ({ variables: CopyVariables }) => Promise<any>;

export type ItemsQueryResponse = {
  fetchMore: any;
} & QueryResponse;

export type RelatedItemsQueryResponse = {
  fetchMore: any;
} & QueryResponse;

export type DetailQueryResponse = {
  error?: Error;
  subscribeToMore: any;
} & QueryResponse;

// query response
export type PipelineLabelsQueryResponse = {
  pipelineLabels: IPipelineLabel[];
} & QueryResponse;

export type PipelineLabelDetailQueryResponse = {
  pipelineLabelDetail: IPipelineLabel;
} & QueryResponse;

// mutation response
export type AddPipelineLabelMutationResponse = ({
  variables: IPipelineLabelVariables
}) => Promise<any>;

export type EditPipelineLabelMutationResponse = ({
  variables: EditMutationVariables
}) => Promise<any>;

export type RemovePipelineLabelMutationVariables = {
  _id: string;
};

export type RemovePipelineLabelMutationResponse = {
  removeMutation: (params: {
    variables: RemovePipelineLabelMutationVariables;
  }) => Promise<void>;
};

export type PipelineLabelMutationVariables = {
  pipelineId: string;
  targetId: string;
  labelIds: string[];
};

export type PipelineLabelMutationResponse = {
  pipelineLabelMutation: (params: {
    variables: PipelineLabelMutationVariables;
  }) => Promise<any>;
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
  segment?: string;
  assignedToMe?: string;
  startDate?: string;
  endDate?: string;
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

export type ConvertToMutationVariables = {
  type: string;
  _id: string;
  itemId?: string;
  itemName?: string;
  stageId?: string;
};

export type ConvertToMutationResponse = {
  conversationConvertToCard: (doc: {
    variables: ConvertToMutationVariables;
  }) => Promise<any>;
};

export type StagesSortItemsMutationResponse = ({
  variables
}: {
  variables: {
    stageId: string;
    type: string;
    proccessId: string;
    sortType: string;
  };
}) => Promise<any>;
