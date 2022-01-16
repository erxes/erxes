import { PipelineTemplates } from '../../../models';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '@erxes/api-utils/src';
import { checkPermission } from '../../utils';

const pipelineTemplateQueries = {
  /**
   *  Pipeline template list
   */
  async pipelineTemplates(
    _root,
    { type }: { type: string },
    { user }: IContext
  ) {
    await checkPermission(type, user, 'showTemplates');

    return PipelineTemplates.find({ type });
  },

  /**
   *  Pipeline template detail
   */
  async pipelineTemplateDetail(
    _root,
    { _id }: { _id: string },
    { user }: IContext
  ) {
    const pipelineTemplate = await PipelineTemplates.getPipelineTemplate(_id);

    await checkPermission(pipelineTemplate.type, user, 'showTemplates');

    return PipelineTemplates.findOne({ _id });
  },

  /**
   *  Pipeline template total count
   */
  pipelineTemplatesTotalCount() {
    return PipelineTemplates.find().countDocuments();
  }
};

moduleRequireLogin(pipelineTemplateQueries);

export default pipelineTemplateQueries;
