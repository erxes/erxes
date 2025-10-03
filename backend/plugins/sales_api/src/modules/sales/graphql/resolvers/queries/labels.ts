import { IContext } from '~/connectionResolvers';
import { moduleRequireLogin } from 'erxes-api-shared/core-modules';

export const pipelineLabelQueries = {
  /**
   *  Pipeline label list
   */
  async salesPipelineLabels(
    _root: undefined,
    { pipelineId, pipelineIds }: { pipelineId: string; pipelineIds: string[] },
    { models }: IContext,
  ) {
    const filter: any = {};

    filter.pipelineId = pipelineId;

    if (pipelineIds) {
      filter.pipelineId = { $in: pipelineIds };
    }

    return models.PipelineLabels.find(filter);
  },

  /**
   *  Pipeline label detail
   */
  async salesPipelineLabelDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.PipelineLabels.findOne({ _id });
  },
};

// moduleRequireLogin(pipelineLabelQueries);
