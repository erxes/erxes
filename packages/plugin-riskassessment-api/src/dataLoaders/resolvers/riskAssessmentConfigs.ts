import { IContext } from '../../connectionResolver';
import { IRiskAssessmentsConfigDocument } from '../../models/definitions/riskassessment';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskAssessment.findOne({ _id });
  },

  async board(
    config: IRiskAssessmentsConfigDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (config.boardId && dataLoaders.board.load(config.boardId)) || null;
  },

  async pipeline(
    config: IRiskAssessmentsConfigDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (config.pipelineId && dataLoaders.pipeline.load(config.pipelineId)) ||
      null
    );
  },

  async stage(
    config: IRiskAssessmentsConfigDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (config.stageId && dataLoaders.stage.load(config.stageId)) || null;
  },

  async field(
    config: IRiskAssessmentsConfigDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (config.customFieldId && dataLoaders.field.load(config.customFieldId)) ||
      null
    );
  },
  async riskAssessment(
    config: IRiskAssessmentsConfigDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (config.riskAssessmentId &&
        dataLoaders.riskAssessment.load(config.riskAssessmentId)) ||
      null
    );
  }
};
