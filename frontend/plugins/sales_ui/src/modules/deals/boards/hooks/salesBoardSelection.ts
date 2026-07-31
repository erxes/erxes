interface SalesBoardSelectionSource {
  _id: string;
  pipelines?: Array<{
    _id: string;
  }>;
}

interface SalesBoardSelection {
  boardId: string;
  pipelineId: string | null;
}

export const resolveSalesBoardSelection = (
  boards: SalesBoardSelectionSource[],
  boardId: string | null,
  pipelineId: string | null,
): SalesBoardSelection | null => {
  const selectedBoard =
    boards.find((board) => board._id === boardId) ?? boards[0];

  if (!selectedBoard) {
    return null;
  }

  const pipelines = selectedBoard.pipelines || [];
  const selectedPipeline =
    pipelines.find((pipeline) => pipeline._id === pipelineId) ?? pipelines[0];

  return {
    boardId: selectedBoard._id,
    pipelineId: selectedPipeline?._id || null,
  };
};
