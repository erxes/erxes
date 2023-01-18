import { IContext } from '../../connectionResolver';
import { IRiskIndicatorsConfigsDocument } from '../../models/definitions/indicator';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskIndicatorConfigs.findOne({ _id });
  },

  async board(
    config: IRiskIndicatorsConfigsDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (config.boardId && dataLoaders.board.load(config.boardId)) || null;
  },

  async pipeline(
    config: IRiskIndicatorsConfigsDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (config.pipelineId && dataLoaders.pipeline.load(config.pipelineId)) ||
      null
    );
  },

  async stage(
    config: IRiskIndicatorsConfigsDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (config.stageId && dataLoaders.stage.load(config.stageId)) || null;
  },

  async field(
    config: IRiskIndicatorsConfigsDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (config.customFieldId && dataLoaders.field.load(config.customFieldId)) ||
      null
    );
  },
  async riskIndicator(
    config: IRiskIndicatorsConfigsDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (config.riskIndicatorId &&
        dataLoaders.riskIndicator.load(config.riskIndicatorId)) ||
      null
    );
  }
};
