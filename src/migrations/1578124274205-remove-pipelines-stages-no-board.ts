import { connect } from '../db/connection';
import { Boards, Forms, Pipelines, Stages } from '../db/models';

module.exports.up = async () => {
  await connect();

  const removeStages = async (filter?: any) => {
    const stages = await Stages.find(filter);

    for (const stage of stages) {
      const pipeline = await Pipelines.findOne({ _id: stage.pipelineId });

      // no pipeline or specific stages
      if (!pipeline || filter) {
        await Stages.deleteOne({ _id: stage._id });

        if (stage.formId) {
          await Forms.deleteOne({ _id: stage.formId });
        }
      }
    }
  };

  const removePipelines = async () => {
    const pipelines = await Pipelines.find();

    // removing pipelines no board
    for (const pipeline of pipelines) {
      const board = await Boards.findOne({ _id: pipeline.boardId });

      // no board
      if (!board) {
        await removeStages({ pipelineId: pipeline._id });

        await Pipelines.deleteOne({ _id: pipeline._id });
      }
    }
  };

  console.log('start migration on remove stages no pipeline');
  await removeStages();

  console.log('start migration on remove pipelines no board');
  await removePipelines();
};
