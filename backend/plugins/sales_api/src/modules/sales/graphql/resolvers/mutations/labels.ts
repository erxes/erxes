import { IContext } from '~/connectionResolvers';
import { IPipelineLabel, IPipelineLabelDocument } from '~/modules/sales/@types';

export const pipelineLabelMutations = {
  /**
   * Creates a new pipeline label
   */
  async salesPipelineLabelsAdd(
    _root: undefined,
    { ...doc }: IPipelineLabel,
    { user, models }: IContext,
  ) {
    return await models.PipelineLabels.createPipelineLabel({
      userId: user._id,
      ...doc,
    });
  },

  /**
   * Edit pipeline label
   */
  async salesPipelineLabelsEdit(
    _root: undefined,
    { _id, ...doc }: IPipelineLabelDocument,
    { models }: IContext,
  ) {
    return await models.PipelineLabels.updatePipelineLabel(_id, doc);
  },

  /**
   * Remove pipeline label
   */
  async salesPipelineLabelsRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return await models.PipelineLabels.removePipelineLabel(_id);
  },

  /**
   * Attach a label
   */
  async salesPipelineLabelsLabel(
    _root: undefined,
    { targetId, labelIds }: { targetId: string; labelIds: string[] },
    { models }: IContext,
  ) {
    return models.PipelineLabels.labelsLabel(targetId, labelIds);
  },
};
