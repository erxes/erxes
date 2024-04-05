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
    { user, subdomain, models, commonQuerySelector }: IContext
  ) {
    await checkPermission(models, subdomain, type, user, 'showTemplates');

    const filter = { ...commonQuerySelector, type };

    return models.PipelineTemplates.find(filter);
  },

  /**
   *  Pipeline template detail
   */
  async pipelineTemplateDetail(
    _root,
    { _id }: { _id: string },
    { user, subdomain, models }: IContext
  ) {
    const pipelineTemplate = await models.PipelineTemplates.getPipelineTemplate(
      _id
    );

    await checkPermission(
      models,
      subdomain,
      pipelineTemplate.type,
      user,
      'showTemplates'
    );

    return models.PipelineTemplates.findOne({ _id });
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
