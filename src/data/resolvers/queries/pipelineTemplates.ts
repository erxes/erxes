import { PipelineTemplates } from '../../../db/models';
import { checkPermission, moduleRequireLogin } from '../../permissions/wrappers';

const pipelineTemplateQueries = {
  /**
   *  Pipeline template list
   */
  pipelineTemplates(_root, { type }: { type: string }) {
    return PipelineTemplates.find({ type });
  },

  /**
   *  Pipeline template detail
   */
  pipelineTemplateDetail(_root, { _id }: { _id: string }) {
    return PipelineTemplates.findOne({ _id });
  },

  /**
   *  Pipeline template total count
   */
  pipelineTemplatesTotalCount() {
    return PipelineTemplates.find().countDocuments();
  },
};

moduleRequireLogin(pipelineTemplateQueries);

checkPermission(pipelineTemplateQueries, 'pipelineTemplates', 'showPipelineTemplates', []);

export default pipelineTemplateQueries;
