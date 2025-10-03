import { IOrderInput } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { IStageDocument } from '~/modules/sales/@types';
import { bulkUpdateOrders } from '~/modules/sales/utils';

export const stageMutations = {
  /**
   * Update stage orders
   */
  async salesStagesUpdateOrder(
    _root,
    { orders }: { orders: IOrderInput[] },
    { models }: IContext,
  ) {
    return models.Stages.updateOrder(orders);
  },

  /**
   * Edit stage
   */
  async salesStagesEdit(
    _root,
    { _id, ...doc }: IStageDocument,
    { models }: IContext,
  ) {
    return await models.Stages.updateStage(_id, doc);
  },

  /**
   * Remove stage
   */
  async salesStagesRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return await models.Stages.removeStage(_id);
  },

  async salesStagesSortItems(
    _root,
    {
      stageId,
      processId,
      sortType,
    }: {
      stageId: string;
      processId: string;
      sortType: string;
    },
    { models }: IContext,
  ) {
    const sortTypes = {
      'created-asc': { createdAt: 1 },
      'created-desc': { createdAt: -1 },
      'modified-asc': { modifiedAt: 1 },
      'modified-desc': { modifiedAt: -1 },
      'close-asc': { closeDate: 1, order: 1 },
      'close-desc': { closeDate: -1, order: 1 },
      'alphabetically-asc': { name: 1 },
    };

    const sort: { [key: string]: any } = sortTypes[sortType] || {};

    if (!sort) {
      throw new Error(
        `Invalid sortType: ${sortType}. Valid values are: ${Object.keys(
          sortTypes,
        ).join(', ')}`,
      );
    }

    if (sortType === 'close-asc') {
      await bulkUpdateOrders({
        collection: models.Deals,
        stageId,
        sort,
        additionFilter: { closeDate: { $ne: null } },
      });
      await bulkUpdateOrders({
        collection: models.Deals,
        stageId,
        sort: { order: 1 },
        additionFilter: { closeDate: null },
        startOrder: 100001,
      });
    } else {
      const response = await bulkUpdateOrders({
        collection: models.Deals,
        stageId,
        sort,
      });

      if (!response) {
        return;
      }
    }

    // const stage = await models.Stages.getStage(stageId);

    // graphqlPubsub.publish(`salesPipelinesChanged:${stage.pipelineId}`, {
    //   salesPipelinesChanged: {
    //     _id: stage.pipelineId,
    //     processId,
    //     action: "reOrdered",
    //     data: {
    //       destinationStageId: stageId
    //     }
    //   }
    // });

    return 'ok';
  },
};
