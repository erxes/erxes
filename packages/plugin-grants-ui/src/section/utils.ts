export const generateExtraParams = (scope, action, object) => {
  let args;

  if (scope === 'cards' && action === 'editItem' && object) {
    args = {
      boardId: object.boardId,
      pipelineId: object.pipeline._id,
      stageId: object.stageId
    };
  }

  return args;
};
