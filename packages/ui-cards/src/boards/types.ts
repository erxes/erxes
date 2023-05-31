import {
  IAttachment,
  MutationVariables,
  QueryResponse
} from '@erxes/ui/src/types';

import { IActivityLog } from '@erxes/ui-log/src/activityLogs/types';
import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { ISavedConformity } from '../conformity/types';
import { ITag } from '@erxes/ui-tags/src/types';
import { IUser } from '@erxes/ui/src/auth/types';

export interface IOptions {
  EditForm: any;
  Item: any;
  type: string;
  title: string;
  queriesName: {
    itemsQuery: string;
    itemsTotalCountQuery: string;
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
    itemsTotalCountQuery: string;
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

export interface IPipeline {
  _id: string;
  name: string;
  boardId: string;
  tagId?: string;
  visibility: string;
  status: string;
  createdAt: Date;
  createdUser: IUser;
  members?: any[];
  departmentIds?: string[];
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
  isCheckDepartment?: boolean;
  excludeCheckUserIds?: string[];
  numberConfig?: string;
  numberSize?: string;
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
  parentId?: string;
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
  relationData?: any;
}

export type SaveItemMutation = ({ variables: IItemParams }) => Promise<any>;
export type RemoveStageMutation = ({
  variables
}: {
  variables: { _id: string };
}) => Promise<any>;

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
  visibility: string;
  memberIds: string[];
  canMoveMemberIds?: string[];
  canEditMemberIds?: string[];
  departmentIds: string[];
  status: string;
  order: number;
  code?: string;
  age?: number;
  defaultTick?: boolean;
}

export interface IConversionStage extends IStage {
  initialDealsTotalCount: number;
  inProcessDealsTotalCount: number;
  stayedDealsTotalCount: number;
  compareNextStage: IStageComparisonInfo;
}

export interface IConversionStagePurchase extends IStage {
  initialPurchasesTotalCount: number;
  inProcessPurchasesTotalCount: number;
  stayedPurchasesTotalCount: number;
  compareNextStagePurchase: IStageComparisonInfo;
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
  startDate: Date;
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
  number?: string;
  relations: any[];
  tags: ITag[];
  tagIds: string[];
  customProperties?: any;
  departmentIds: string[];
  branchIds: string[];
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

export interface IDragStart {
  type: string;
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
} & QueryResponse;

export interface IBoardCount {
  _id: string;
  name: string;
  count: number;
}

export type BoardCountsQueryResponse = {
  boardCounts: IBoardCount[];
} & QueryResponse;

export type PipelinesQueryResponse = {
  pipelines: IPipeline[];
  loading: boolean;
  refetch: ({
    boardId,
    type
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

export type UpdateTimeVariables = {
  _id: string;
  status: string;
  timeSpent: number;
  startDate?: string;
};

export type RemoveMutation = ({ variables: MutationVariables }) => Promise<any>;

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
  subscribeToMore: any;
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

export type RemovePipelineLabelMutationResponse = {
  removeMutation: (params: { variables: MutationVariables }) => Promise<void>;
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
  segmentData?: string;
  assignedToMe?: string;
  startDate?: string;
  endDate?: string;
  pipelineId?: string;
  tagIds?: string[];
  branchIds: string[];
  departmentIds: string[];
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
  bookingProductId?: string;
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

export type ActivityLogsByActionQueryResponse = {
  activityLogsByAction: { activityLogs: IActivityLog[]; totalCount: number };
  totalCount: number;
} & QueryResponse;

export type InternalNotesByActionQueryResponse = {
  internalNotesByAction: { list: IActivityLog[]; totalCount: number };
} & QueryResponse;

export type Item = {
  name: string;
  color: string;
};

// ticket comment mutation
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

export type ITimeData = {
  closeDate?: Date;
  startDate?: Date;
  tagIds?: string[];
  assignedUserIds?: string[];
  stageId?: string;
};
