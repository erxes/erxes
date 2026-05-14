import { IUser } from "ui-modules/index";

export interface IPipeline {
  _id: string;
  name: string;
  boardId: string;
  tagId?: string;
  visibility: string;
  status: string;
  createdAt: Date;
  createdUser: IUser;
  members?: IUser[];
  departmentIds?: string[];
  branchIds?: string[];
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
  isCheckDate?: boolean;
  isCheckUser?: boolean;
  isCheckDepartment?: boolean;
  excludeCheckUserIds?: string[];
  numberConfig?: string;
  numberSize?: string;
  nameConfig?: string;
  initialCategoryIds: string[];
  excludeCategoryIds: string[];
  excludeProductIds: string[];

  paymentIds?: string[];
  paymentTypes?: any[];
  erxesAppToken?: string;
}

export interface ISelectPipelinesContext {
  pipelineIds: string[];
  pipelines: IPipeline[];
  setPipelines: (pipelines: IPipeline[]) => void;
  onSelect: (pipeline: IPipeline) => void;
  loading: boolean;
  error: string | null;
  boardId?: string;
}

export interface PipelinesInlineProps {
  pipelineIds?: string[];
  pipelines?: IPipeline[];
  placeholder?: string;
  updatePipelines?: (pipelines: IPipeline[]) => void;
}
