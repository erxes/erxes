import { IContext } from '../../connectionResolver';
import { IRiskAssessmentsConfigsDocument } from '../../models/definitions/indicator';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskAssessmentsConfigs.findOne({ _id });
  },

  async board(
    config: IRiskAssessmentsConfigsDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (config.boardId && dataLoaders.board.load(config.boardId)) || null;
  },

  async pipeline(
    config: IRiskAssessmentsConfigsDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (config.pipelineId && dataLoaders.pipeline.load(config.pipelineId)) ||
      null
    );
  },

  async stage(
    config: IRiskAssessmentsConfigsDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (config.stageId && dataLoaders.stage.load(config.stageId)) || null;
  },

  async field(
    config: IRiskAssessmentsConfigsDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (config.customFieldId && dataLoaders.field.load(config.customFieldId)) ||
      null
    );
  },
  async riskIndicator(
    config: IRiskAssessmentsConfigsDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (config.indicatorId &&
        dataLoaders.riskIndicator.load(config.indicatorId)) ||
      null
    );
  }
};
