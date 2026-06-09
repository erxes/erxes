import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { IDealDocument } from '../../@types';
import { getEnv } from 'erxes-api-shared/utils';

export const salesReferenceCustomResolvers: TRecordReferencesConfig<
  IModels,
  IDealDocument
>['resolvers'] = {
  dealDisplayName: async ({ target }) => {
    return target.name || target.number || target._id;
  },

  dealLink: async ({ models, target }) => {
    const DOMAIN = getEnv({ name: 'DOMAIN' });

    const stage = await models.Stages.getStage(target.stageId);
    const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
    const board = await models.Boards.getBoard(pipeline.boardId);

    return `${DOMAIN}/deal/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${target._id}`;
  },

  pipelineLabels: async ({ models, target }) => {
    const labels = await models.PipelineLabels.find({
      _id: { $in: target?.labelIds || [] },
    }).lean();

    return (
      labels
        .map(({ name }) => name)
        .filter(Boolean)
        .join(', ') || '-'
    );
  },

  productsAmount: async ({ target }) => {
    return (target.productsData || []).reduce((total, product) => {
      if (product.tickUsed) {
        return total;
      }

      return total + (product?.amount || 0);
    }, 0);
  },
  excludeLoyaltyAmount: async ({ models, target, ...props }) => {
    console.log({ target, ...props });
    const stage = await models.Stages.getStage(target.stageId);

    const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
    const scoreCampaignTypes = (pipeline?.paymentTypes || []).filter(
      ({ scoreCampaignId }) => !!scoreCampaignId,
    );
    return Object.entries(target?.paymentsData || {})
      .filter(
        ([type]) => !scoreCampaignTypes.map(({ type }) => type).includes(type),
      )
      .map(([type, obj]) => ({
        type,
        ...obj,
      }))
      .reduce((sum, payment) => sum + (payment?.amount || 0), 0);
  },
};
