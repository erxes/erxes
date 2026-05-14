export interface IStage {
  _id: string;
  name: string;
  type: string;
  probability: string;
  index?: number;
  itemId?: string;
  unUsedAmount?: number;
  amount?: number | string | null;
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

export interface ISelectStagesContext {
  stageIds: string[];
  stages: IStage[];
  setStages: (stages: IStage[]) => void;
  onSelect: (stage: IStage) => void;
  loading: boolean;
  error: string | null;
  pipelineId?: string;
}

export interface StagesInlineProps {
  stageIds?: string[];
  stages?: IStage[];
  placeholder?: string;
  updateStages?: (stages: IStage[]) => void;
  pipelineId?: string;
}
