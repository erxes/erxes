import { PipelineLabels } from '../../../models';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

const pipelineLabelQueries = {
  /**
   *  Pipeline label list
   */
  pipelineLabels(_root, { pipelineId }: { pipelineId: string }) {
    return PipelineLabels.find({ pipelineId });
  },

  /**
   *  Pipeline label detail
   */
  pipelineLabelDetail(_root, { _id }: { _id: string }) {
    return PipelineLabels.findOne({ _id });
  }
};

moduleRequireLogin(pipelineLabelQueries);

export default pipelineLabelQueries;
