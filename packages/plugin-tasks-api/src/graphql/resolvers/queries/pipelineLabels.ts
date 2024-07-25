import { moduleRequireLogin } from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";

const pipelineLabelQueries = {
  /**
   *  Pipeline label list
   */
  async tasksPipelineLabels(
    _root,
    { pipelineId, pipelineIds }: { pipelineId: string; pipelineIds: string[] },
    { models: { PipelineLabels } }: IContext
  ) {
    const filter: any = {};

    filter.pipelineId = pipelineId;

    if (pipelineIds) {
      filter.pipelineId = { $in: pipelineIds };
    }

    return PipelineLabels.find(filter);
  },

  /**
   *  Pipeline label detail
   */
  async tasksPipelineLabelDetail(
    _root,
    { _id }: { _id: string },
    { models: { PipelineLabels } }: IContext
  ) {
    return PipelineLabels.findOne({ _id });
  }
};

moduleRequireLogin(pipelineLabelQueries);

export default pipelineLabelQueries;
