import { IPipelineLabel } from '../../../models/definitions/pipelineLabels';
import { putCreateLog, putUpdateLog, putDeleteLog } from '../../../logUtils';
import { IContext } from '../../../connectionResolver';

interface IPipelineLabelsEdit extends IPipelineLabel {
  _id: string;
}

const pipelineLabelMutations = {
  /**
   * Creates a new pipeline label
   */
  async pipelineLabelsAdd(
    _root,
    { ...doc }: IPipelineLabel,
    { user, models, subdomain }: IContext
  ) {
    const pipelineLabel = await models.PipelineLabels.createPipelineLabel({
      createdBy: user._id,
      ...doc
    });

    await putCreateLog(
      models,
      subdomain,
      {
        type: 'pipelineLabel',
        newData: {
          ...doc,
          createdBy: user._id,
          createdAt: pipelineLabel.createdAt
        },
        object: pipelineLabel
      },
      user
    );

    return pipelineLabel;
  },

  /**
   * Edit pipeline label
   */
  async pipelineLabelsEdit(
    _root,
    { _id, ...doc }: IPipelineLabelsEdit,
    { user, models, subdomain }: IContext
  ) {
    const pipelineLabel = await models.PipelineLabels.getPipelineLabel(_id);
    const updated = await models.PipelineLabels.updatePipelineLabel(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: 'pipelineLabel',
        newData: doc,
        object: pipelineLabel
      },
      user
    );

    return updated;
  },

  /**
   * Remove pipeline label
   */
  async pipelineLabelsRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const pipelineLabel = await models.PipelineLabels.getPipelineLabel(_id);
    const removed = await models.PipelineLabels.removePipelineLabel(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: 'pipelineLabel', object: pipelineLabel },
      user
    );

    return removed;
  },

  /**
   * Attach a label
   */
  pipelineLabelsLabel(
    _root,
    {
      pipelineId,
      targetId,
      labelIds
    }: { pipelineId: string; targetId: string; labelIds: string[] },
    { models }: IContext
  ) {
    return models.PipelineLabels.labelsLabel(pipelineId, targetId, labelIds);
  }
};

export default pipelineLabelMutations;
