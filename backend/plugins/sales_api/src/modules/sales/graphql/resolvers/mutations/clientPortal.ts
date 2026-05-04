import { Resolver } from 'erxes-api-shared/core-types';
import {
  markResolvers,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';
import { subscriptionWrapper } from '../utils';
import { createRelations, getNewOrder } from '~/modules/sales/utils';

export const cpDealMutations: Record<string, Resolver> = {
  async cpDealsAdd(
    _root,
    doc: IDeal & { processId: string; aboveItemId: string },
    { models, subdomain, cpUser, clientPortal }: IContext,
  ) {
    const userId =
      cpUser?.erxesCustomerId ||
      cpUser?._id ||
      clientPortal?._id ||
      doc?.userId;

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
};

markResolvers(cpDealMutations, {
  wrapperConfig: {
    forClientPortal: true,
  },
});
