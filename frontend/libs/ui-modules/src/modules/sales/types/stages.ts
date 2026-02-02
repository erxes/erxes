export interface IStage {
  _id: string;
  name: string;
  pipelineId: string;
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
