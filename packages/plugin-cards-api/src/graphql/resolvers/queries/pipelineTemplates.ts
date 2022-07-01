import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { checkPermission } from '../../utils';

const pipelineTemplateQueries = {
  /**
   *  Pipeline template list
   */
  async pipelineTemplates(
    _root,
    { type }: { type: string },
    { user, models: { PipelineTemplates }, commonQuerySelector }: IContext
  ) {
    await checkPermission(type, user, 'showTemplates');

    const filter = { ...commonQuerySelector, type };

    return PipelineTemplates.find(filter);
  },

  /**
   *  Pipeline template detail
   */
  async pipelineTemplateDetail(
    _root,
    { _id }: { _id: string },
    { user, models: { PipelineTemplates } }: IContext
  ) {
    const pipelineTemplate = await PipelineTemplates.getPipelineTemplate(_id);

    await checkPermission(pipelineTemplate.type, user, 'showTemplates');

    return PipelineTemplates.findOne({ _id });
  },

  /**
   *  Pipeline template total count
   */
  pipelineTemplatesTotalCount(
    _root,
    _args,
    { models: { PipelineTemplates } }: IContext
  ) {
    return PipelineTemplates.find().count();
  }
};

moduleRequireLogin(pipelineTemplateQueries);

export default pipelineTemplateQueries;
