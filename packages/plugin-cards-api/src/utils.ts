import { Boards, Pipelines, Stages } from "./models";

export const configReplacer = config => {
  const now = new Date();

  // replace type of date
  return config
    .replace(/\{year}/g, now.getFullYear().toString())
    .replace(/\{month}/g, (now.getMonth() + 1).toString())
    .replace(/\{day}/g, now.getDate().toString());
};


export const generateConditionStageIds = async ({
  boardId,
  pipelineId,
  options
}: {
  boardId?: string;
  pipelineId?: string;
  options?: any;
}) => {
  let pipelineIds: string[] = [];

  if (options && options.pipelineId) {
    pipelineIds = [options.pipelineId];
  }

  if (boardId && (!options || !options.pipelineId)) {
    const board = await Boards.getBoard(boardId);

    const pipelines = await Pipelines.find(
      {
        _id: {
          $in: pipelineId ? [pipelineId] : board.pipelines || []
        }
      },
      { _id: 1 }
    );

    pipelineIds = pipelines.map(p => p._id);
  }

  const stages = await Stages.find({ pipelineId: pipelineIds }, { _id: 1 });

  return stages.map(s => s._id);
};