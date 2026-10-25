import DataLoader from 'dataloader';
import { IRef } from '.';
import { IPipeline } from '~/modules/sales/@types';
import { IModels } from '~/connectionResolvers';

type TContactKind = 'customer' | 'company';

const CONTACT_TYPENAMES: Record<TContactKind, string> = {
  customer: 'Customer',
  company: 'Company',
};

// Each deal's customer or company (kept on the deal), as a list of 0–1.
const contactsByDealId =
  (models: IModels, kind: TContactKind) =>
  async (dealIds: readonly string[]): Promise<IRef[][]> => {
    const deals = await models.Deals.find(
      { _id: { $in: dealIds } },
      { customerId: 1, companyId: 1 },
    ).lean();
    const contactByDeal = new Map(
      deals.map((deal) => [
        deal._id,
        kind === 'customer' ? deal.customerId : deal.companyId,
      ]),
    );

    return dealIds.map((id) => {
      const contactId = contactByDeal.get(id);

      return contactId
        ? [{ __typename: CONTACT_TYPENAMES[kind], _id: contactId }]
        : [];
    });
  };

export const dealLoader = (subdomain: string, models: IModels) => ({
  companiesByDealId: new DataLoader<string, IRef[]>(
    contactsByDealId(models, 'company'),
  ),

  customersByDealId: new DataLoader<string, IRef[]>(
    contactsByDealId(models, 'customer'),
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
