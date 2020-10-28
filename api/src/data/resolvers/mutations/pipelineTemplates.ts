import * as _ from 'underscore';
import { PipelineTemplates } from '../../../db/models';
import {
  IPipelineTemplate,
  IPipelineTemplateStage
} from '../../../db/models/definitions/pipelineTemplates';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { IContext } from '../../types';
import { registerOnboardHistory } from '../../utils';
import { checkPermission } from '../boardUtils';

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
    { user, docModifier }: IContext
  ) {
    await checkPermission(doc.type, user, 'templatesAdd');

    const pipelineTemplate = await PipelineTemplates.createPipelineTemplate(
      docModifier({ createdBy: user._id, ...doc }),
      stages
    );

    await putCreateLog(
      {
        type: MODULE_NAMES.PIPELINE_TEMPLATE,
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
    { user }: IContext
  ) {
    await checkPermission(doc.type, user, 'templatesEdit');

    const pipelineTemplate = await PipelineTemplates.getPipelineTemplate(_id);
    const updated = await PipelineTemplates.updatePipelineTemplate(
      _id,
      doc,
      stages
    );

    await putUpdateLog(
      {
        type: MODULE_NAMES.PIPELINE_TEMPLATE,
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
    { user }: IContext
  ) {
    const pipelineTemplate = await PipelineTemplates.getPipelineTemplate(_id);

    await checkPermission(pipelineTemplate.type, user, 'templatesDuplicate');

    await registerOnboardHistory({
      type: `${pipelineTemplate.type}TemplatesDuplicate`,
      user
    });

    return PipelineTemplates.duplicatePipelineTemplate(_id);
  },

  /**
   * Remove pipeline template
   */
  async pipelineTemplatesRemove(
    _root,
    { _id }: { _id: string },
    { user }: IContext
  ) {
    const pipelineTemplate = await PipelineTemplates.getPipelineTemplate(_id);

    await checkPermission(pipelineTemplate.type, user, 'templatesRemove');

    const removed = await PipelineTemplates.removePipelineTemplate(_id);

    await putDeleteLog(
      { type: MODULE_NAMES.PIPELINE_TEMPLATE, object: pipelineTemplate },
      user
    );

    return removed;
  }
};

export default pipelineTemplateMutations;
