export interface DealSelectProps {
  boardId?: string;
  pipelineId?: string;
  type?: string;
  onChangePipeline?: (pipelineId: string | string[], callback?: () => void) => void;
  onChangeBoard?: (boardId: string | string[], callback?: () => void) => void;
}