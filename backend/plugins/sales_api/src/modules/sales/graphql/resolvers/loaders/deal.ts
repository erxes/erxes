import DataLoader from 'dataloader';
import { hasContactFields } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IRef } from '.';
import { IPipeline } from '~/modules/sales/@types';
import { IModels } from '~/connectionResolvers';

type TContactKind = 'customer' | 'company';

const CONTACT_CONTENT_TYPES: Record<TContactKind, string> = {
  customer: 'core:customer',
  company: 'core:company',
};

const CONTACT_TYPENAMES: Record<TContactKind, string> = {
  customer: 'Customer',
  company: 'Company',
};

/**
 * Each deal's contacts of one kind: from the deal once it keeps them, else
 * (not migrated yet) from relations, in one call for all such deals.
 */
const contactsByDealId =
  (subdomain: string, models: IModels, kind: TContactKind) =>
  async (dealIds: readonly string[]): Promise<IRef[][]> => {
    const idsByDeal = new Map<string, string[]>();
    const deals = await models.Deals.find(
      { _id: { $in: dealIds } },
      { customerId: 1, companyId: 1 },
    ).lean();

    for (const deal of deals) {
      if (hasContactFields(deal)) {
        const contactId = kind === 'customer' ? deal.customerId : deal.companyId;

        idsByDeal.set(deal._id, contactId ? [contactId] : []);
      }
    }

    const fromRelations = dealIds.filter((id) => !idsByDeal.has(id));

    if (fromRelations.length) {
      const relations = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'relation',
        action: 'filterRelations',
        input: {
          contentType: 'sales:deal',
          contentIds: fromRelations,
          relatedContentType: CONTACT_CONTENT_TYPES[kind],
        },
        defaultValue: [],
      });

      for (const { entities = [] } of relations) {
        const dealId = entities.find(
          (e) => e.contentType === 'sales:deal',
        )?.contentId;
        const contactId = entities.find(
          (e) => e.contentType === CONTACT_CONTENT_TYPES[kind],
        )?.contentId;

        if (dealId && contactId) {
          idsByDeal.set(dealId, [...(idsByDeal.get(dealId) || []), contactId]);
        }
      }
    }

    return dealIds.map((id) =>
      (idsByDeal.get(id) || []).map((contactId) => ({
        __typename: CONTACT_TYPENAMES[kind],
        _id: contactId,
      })),
    );
  };

export const dealLoader = (subdomain: string, models: IModels) => ({
  companiesByDealId: new DataLoader<string, IRef[]>(
    contactsByDealId(subdomain, models, 'company'),
  ),

  customersByDealId: new DataLoader<string, IRef[]>(
    contactsByDealId(subdomain, models, 'customer'),
  ),

  pipelineByDealId: new DataLoader<string, IPipeline>(async (stageIds) => {
    const pipelineById = {};
    const pipelineByStageId = {};

    const stages = await models.Stages.find({ _id: { $in: stageIds } }).lean();
    const pipelineIds = stages.map((st) => st.pipelineId);
    const pipelines = await models.Pipelines.find({
      _id: { $in: pipelineIds },
    }).lean();

    for (const pipeline of pipelines) {
      pipelineById[pipeline._id] = pipeline;
    }

    for (const stage of stages) {
      pipelineByStageId[stage._id] = pipelineById[stage.pipelineId];
    }

    return stageIds.map((stageId) => pipelineByStageId[stageId]);
  }),
});
