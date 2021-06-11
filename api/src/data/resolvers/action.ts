import { Pipelines, Stages } from '../../db/models';
import { IAction } from '../../db/models/definitions/fields';

export default {
  async pipelineId(root: IAction) {
    if (root.stageId) {
      const stage = await Stages.findOne({ _id: root.stageId || '' }).lean();

      return stage.pipelineId;
    }
  },

  async boardId(root: IAction) {
    if (root.stageId) {
      const stage = await Stages.findOne({ _id: root.stageId }).lean();
      const pipeLine = await Pipelines.findOne({
        _id: stage.pipelineId
      }).lean();

      return pipeLine.boardId;
    }
  }
};
