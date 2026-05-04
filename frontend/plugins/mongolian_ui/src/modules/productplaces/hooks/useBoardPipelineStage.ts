type SetFormData<T> = React.Dispatch<React.SetStateAction<T>>;

export function useBoardPipelineStage<
  T extends { boardId: string; pipelineId: string; stageId: string },
>(setFormData: SetFormData<T>) {
  const handleBoardChange = (boardId: string) => {
    setFormData((prev) => ({ ...prev, boardId, pipelineId: '', stageId: '' }));
  };

  const handlePipelineChange = (pipelineId: string) => {
    setFormData((prev) => ({ ...prev, pipelineId, stageId: '' }));
  };

  return { handleBoardChange, handlePipelineChange };
}
