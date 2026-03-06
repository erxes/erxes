export interface DealSelectProps {
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  type?: string;
  onChangeStage?: (stageId: string | string[], callback?: () => void) => void;
  onChangePipeline?: (pipelineId: string | string[], callback?: () => void) => void;
  onChangeBoard?: (boardId: string | string[], callback?: () => void) => void;
}