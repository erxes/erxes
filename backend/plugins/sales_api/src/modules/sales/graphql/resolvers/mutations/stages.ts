import { IOrderInput } from 'erxes-api-shared/core-types';
import { graphqlPubsub } from 'erxes-api-shared/utils';
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
    // No permission check required
    return models.Stages.updateOrder(orders);
  },

  /**
   * Edit stage
   */
  async salesStagesEdit(
    _root,
    { _id, ...doc }: IStageDocument,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('stagesEdit');

    const oldStage = await models.Stages.getStage(_id);
    const updated = await models.Stages.updateStage(_id, doc);

    // Archiving a stage takes a column off every open board, so tell the other
    // sessions rather than leaving them on a pipeline that no longer matches.
    if (doc.status && doc.status !== oldStage.status) {
      await graphqlPubsub.publish(
        `salesPipelinesChanged:${updated.pipelineId}`,
        {
          salesPipelinesChanged: {
            _id: updated.pipelineId,
            action: 'stageStatusChanged',
            data: { stageId: updated._id, status: updated.status },
          },
        },
      );
    }

    return updated;
  },

  /**
   * Remove stage
   */
  async salesStagesRemove(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('stagesRemove');
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
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('itemsSort');

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

    return 'ok';
  },
};
