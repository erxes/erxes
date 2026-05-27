import { Resolver } from 'erxes-api-shared/core-types';
import { markResolvers, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';
import { subscriptionWrapper } from '../utils';
import { createRelations, getNewOrder } from '~/modules/sales/utils';

const getCPUserId = ({ cpUser, clientPortal }: IContext, doc?: IDeal) =>
  cpUser?.erxesCustomerId || cpUser?._id || clientPortal?._id || doc?.userId;

const assertCPDealAccess = async (
  subdomain: string,
  dealId: string,
  cpUserId: string,
  dealUserId?: string,
) => {
  if (!cpUserId) {
    throw new Error('Client portal user required');
  }

  if (dealUserId === `cp:${cpUserId}`) {
    return;
  }

  const relatedDealIds = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'relation',
    action: 'getRelationIds',
    input: {
      contentType: 'core:cp.user',
      contentId: cpUserId,
      relatedContentType: 'sales:deal',
    },
    defaultValue: [],
  });

  if (!relatedDealIds.includes(dealId)) {
    throw new Error('Permission denied');
  }
};

export const cpDealMutations: Record<string, Resolver> = {
  async cpDealsAdd(
    _root,
    doc: IDeal & { processId: string; aboveItemId: string },
    context: IContext,
  ) {
    const { models, subdomain } = context;
    const userId = getCPUserId(context, doc);

    doc.initialStageId = doc.stageId;

    const extendedDoc = {
      ...doc,
      modifiedBy: `cp:${userId}`,
      userId: `cp:${userId}`,
      order: await getNewOrder({
        collection: models.Deals,
        stageId: doc.stageId,
        aboveItemId: doc.aboveItemId,
      }),
    };

    if (extendedDoc.propertiesData) {
      // clean custom field values
      extendedDoc.propertiesData = await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        method: 'mutation',
        module: 'fields',
        action: 'validateFieldValues',
        input: extendedDoc.propertiesData,
        defaultValue: {},
      });
    }

    const deal = await models.Deals.createDeal(extendedDoc);

    const stage = await models.Stages.getStage(deal.stageId);

    await createRelations(subdomain, {
      dealId: deal._id,
      companyIds: doc.companyIds,
      customerIds: doc.customerIds,
    });

    if (deal && userId) {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'relation',
        action: 'createRelation',
        input: {
          relation: {
            entities: [
              {
                contentType: 'core:cp.user',
                contentId: userId,
              },
              {
                contentType: 'sales:deal',
                contentId: deal._id,
              },
            ],
          },
        },
      });
    }

    await subscriptionWrapper(models, {
      action: 'create',
      deal,
      pipelineId: stage.pipelineId,
    });

    return deal;
  },

  async cpDealsEdit(
    _root,
    {
      _id,
      processId: _processId,
      aboveItemId,
      ...doc
    }: IDeal & { _id: string; processId: string; aboveItemId?: string },
    context: IContext,
  ) {
    const { models, subdomain } = context;
    const userId = getCPUserId(context, doc);
    const oldDeal = await models.Deals.getDeal(_id);

    await assertCPDealAccess(subdomain, _id, userId, oldDeal.userId);

    const extendedDoc: IDeal & { modifiedAt?: Date } = {
      ...doc,
      modifiedAt: new Date(),
      modifiedBy: `cp:${userId}`,
    };

    if (doc.stageId && doc.stageId !== oldDeal.stageId) {
      extendedDoc.stageChangedDate = new Date();
      extendedDoc.order = await getNewOrder({
        collection: models.Deals,
        stageId: doc.stageId,
        aboveItemId,
      });
    }

    if (extendedDoc.propertiesData) {
      extendedDoc.propertiesData = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'fields',
        action: 'validateFieldValues',
        input: extendedDoc.propertiesData,
        defaultValue: {},
      });
    }

    if (extendedDoc.tagIds?.length) {
      extendedDoc.tagIds = extendedDoc.tagIds.filter((tagId) => tagId);
    }

    const updatedDeal = await models.Deals.updateDeal(_id, extendedDoc);
    const stage = await models.Stages.getStage(updatedDeal.stageId);

    await subscriptionWrapper(models, {
      action: 'update',
      deal: updatedDeal,
      oldDeal,
      pipelineId: stage.pipelineId,
    });

    return updatedDeal;
  },
};

markResolvers(cpDealMutations, {
  wrapperConfig: {
    forClientPortal: true,
  },
});
