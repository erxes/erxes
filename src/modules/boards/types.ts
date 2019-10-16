import { IAttachment } from 'modules/common/types';
import { ISavedConformity } from 'modules/conformity/types';
import { IUser } from '../auth/types';
import { ICompany } from '../companies/types';
import { ICustomer } from '../customers/types';

export interface IOptions {
  EditForm: any;
  PortableItem?: any;
  Item: any;
  type: string;
  title: string;
  queriesName: { itemsQuery: string; detailQuery: string };
  mutationsName: {
    addMutation: string;
    editMutation: string;
    removeMutation: string;
    changeMutation: string;
    updateOrderMutation: string;
    watchMutation: string;
  };
  queries: { itemsQuery: string; detailQuery: string };
  mutations: {
    addMutation: string;
    editMutation: string;
    removeMutation: string;
    changeMutation: string;
    updateOrderMutation: string;
    watchMutation: string;
  };
  texts: {
    addText: string;
    addSuccessText: string;
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
  reminderMinute?: number;
}

export type SaveItemMutation = ({ variables: IItemParams }) => Promise<any>;

export interface IPipeline {
  _id: string;
  name: string;
  boardId: string;
  visibility: string;
  members?: IUser[];
  memberIds?: string[];
  bgColor?: string;
  isWatched: boolean;
  // growth hack
  startDate?: Date;
  endDate?: Date;
  metric?: string;
  hackScoringType?: string;
  templateId?: string;
  state?: string;
  itemsTotalCount?: number;
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
  initialDealsTotalCount: number;
  inProcessDealsTotalCount: number;
  stayedDealsTotalCount: number;
  compareNextStage: IStageComparisonInfo;
  formId: string;
}

export interface IItem {
  _id: string;
  name: string;
  order: number;
  stageId: string;
  closeDate: Date;
  description: string;
  amount: number;
  modifiedAt: Date;
  assignedUsers: IUser[];
  companies: ICompany[];
  customers: ICustomer[];
  attachments?: IAttachment[];
  pipeline: IPipeline;
  stage?: IStage;
  isWatched?: boolean;
  priority?: string;
  hasNotified?: boolean;
  isComplete: boolean;
  reminderMinute: number;
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

export type PipelinesQueryResponse = {
  pipelines: IPipeline[];
  loading: boolean;
  refetch: ({ boardId }: { boardId?: string }) => Promise<any>;
};

export type TemplatesQueryResponse = {
  growthHackTemplates: IPipeline[];
  loading: boolean;
};

export type StagesQueryResponse = {
  stages: IStage[];
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
};

export interface IFilterParams extends ISavedConformity {
  itemId?: string;
  search?: string;
  stageId?: string;
  customerIds?: string;
  companyIds?: string;
  assignedUserIds?: string;
  nextDay?: string;
  nextWeek?: string;
  nextMonth?: string;
  noCloseDate?: string;
  overdue?: string;
}

export interface IEditFormContent {
  state: any;
  onChangeAttachment: (attachments: IAttachment[]) => void;
  onChangeField: (
    name:
      | 'name'
      | 'stageId'
      | 'description'
      | 'closeDate'
      | 'assignedUserIds'
      | 'customers'
      | 'companies'
      | 'isComplete'
      | 'reminderMinute',
    value: any
  ) => void;
  copy: () => void;
  remove: (id: string) => void;
  onBlurFields: (name: string, value: string) => void;
}
