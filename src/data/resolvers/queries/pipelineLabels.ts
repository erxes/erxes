import { PipelineLabels } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions/wrappers';

const pipelineLabelQueries = {
  /**
   *  Pipeline label list
   */
  pipelineLabels(_root, { type, pipelineId }: { type: string; pipelineId: string }) {
    return PipelineLabels.find({ type, pipelineId });
  },

  /**
   *  Pipeline label detail
   */
  pipelineLabelDetail(_root, { _id }: { _id: string }) {
    return PipelineLabels.findOne({ _id });
  },
};

moduleRequireLogin(pipelineLabelQueries);

export default pipelineLabelQueries;
