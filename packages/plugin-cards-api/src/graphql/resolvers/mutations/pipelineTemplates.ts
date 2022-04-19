import * as _ from 'underscore';
import {
  IPipelineTemplate,
  IPipelineTemplateStage
} from '../../../models/definitions/pipelineTemplates';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../../logUtils';
import { checkPermission } from '../../utils';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';

interface IPipelineTemplatesEdit extends IPipelineTemplate {
  _id: string;
  stages: IPipelineTemplateStage[];
}

const pipelineTemplateMutations = {
  /**
   * Create new pipeline template
   */
  async pipelineTemplatesAdd(
    _root,
    { stages, ...doc }: IPipelineTemplate,
    { user, docModifier, models, subdomain }: IContext
  ) {
    await checkPermission(doc.type, user, 'templatesAdd');

    const pipelineTemplate = await models.PipelineTemplates.createPipelineTemplate(
      docModifier({ createdBy: user._id, ...doc }),
      stages
    );

    await putCreateLog(
      models,
      subdomain,
      {
        type: 'pipelineTemplate',
        newData: { ...doc, stages: pipelineTemplate.stages },
        object: pipelineTemplate
      },
      user
    );

    return pipelineTemplate;
  },

  /**
   * Edit pipeline template
   */
  async pipelineTemplatesEdit(
    _root,
    { _id, stages, ...doc }: IPipelineTemplatesEdit,
    { user, models, subdomain }: IContext
  ) {
    await checkPermission(doc.type, user, 'templatesEdit');

    const pipelineTemplate = await models.PipelineTemplates.getPipelineTemplate(_id);
    const updated = await models.PipelineTemplates.updatePipelineTemplate(
      _id,
      doc,
      stages
    );

    await putUpdateLog(
      models,
      subdomain,
      {
        type: 'pipelineTemplate',
        newData: { ...doc, stages: updated.stages },
        object: pipelineTemplate,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Duplicate pipeline template
   */
  async pipelineTemplatesDuplicate(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const pipelineTemplate = await models.PipelineTemplates.getPipelineTemplate(_id);

    await checkPermission(pipelineTemplate.type, user, 'templatesDuplicate');

      sendCoreMessage({
        subdomain,
        action: 'registerOnboardHistory',
        data: {
          type: `${pipelineTemplate.type}TemplatesDuplicate`,
          user
        }
      });

    return models.PipelineTemplates.duplicatePipelineTemplate(_id);
  },

  /**
   * Remove pipeline template
   */
  async pipelineTemplatesRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const pipelineTemplate = await models.PipelineTemplates.getPipelineTemplate(_id);

    await checkPermission(pipelineTemplate.type, user, 'templatesRemove');

    const removed = await models.PipelineTemplates.removePipelineTemplate(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: 'pipelineTemplate', object: pipelineTemplate },
      user
    );

    return removed;
  }
};

export default pipelineTemplateMutations;
