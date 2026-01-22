import { IContext } from '~/connectionResolvers';
import { IPipelineLabel, IPipelineLabelDocument } from '~/modules/sales/@types';
import { subscriptionWrapper } from '../utils';

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
    const { oldDeal, deal } = await models.PipelineLabels.labelObject({ dealId: targetId, labelIds });
    const stage = await models.Stages.getStage(deal.stageId);

    await subscriptionWrapper(models, {
      action: 'update',
      deal,
      oldDeal,
      pipelineId: stage.pipelineId,
    });
  },
};
