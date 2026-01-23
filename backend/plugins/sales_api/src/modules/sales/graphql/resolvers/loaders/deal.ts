import DataLoader from 'dataloader';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IRef } from '.';
import { IPipeline } from '~/modules/sales/@types';
import { IModels } from '~/connectionResolvers';
import { pipeline } from 'stream';

export const dealLoader = (subdomain: string, models: IModels) => ({
  companiesByDealId: new DataLoader<string, IRef[]>(async (dealIds) => {
    const companyIds: string[] = [];
    const companyIdsByItemId = {};

    const companyRelations = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'relation',
      action: 'filterRelations',
      input: {
        contentType: 'sales:deal',
        contentIds: dealIds,
        relatedContentType: 'core:company'
      },
      defaultValue: [],
    });

    for (const relation of companyRelations) {
      const { entities } = relation;
      const dealId = entities.find(e => e.contentType === 'sales:deal')?.contentId ?? '';
      const companyId = entities.find(e => e.contentType === 'core:company')?.contentId ?? '';
      companyIds.push(companyId);

      if (!Object.keys(companyIdsByItemId).includes(dealId)) {
        companyIdsByItemId[dealId] = []
      }

      companyIdsByItemId[dealId].push(companyId)
    }

    return dealIds.map((id) =>
      (companyIdsByItemId[id] || []).map((companyId) => ({
        __typename: 'Company',
        _id: companyId,
      })),
    );
  }),

  customersByDealId: new DataLoader<string, IRef[]>(async (dealIds) => {
    const customerIds: string[] = [];
    const customerIdsByItemId = {};

    const customerRelations = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'relation',
      action: 'filterRelations',
      input: {
        contentType: 'sales:deal',
        contentIds: dealIds,
        relatedContentType: 'core:customer'
      },
      defaultValue: [],
    });

    for (const relation of customerRelations) {
      const { entities } = relation;
      const dealId = entities.find(e => e.contentType === 'sales:deal')?.contentId ?? '';
      const customerId = entities.find(e => e.contentType === 'core:customer')?.contentId ?? '';
      customerIds.push(customerId);

      if (!Object.keys(customerIdsByItemId).includes(dealId)) {
        customerIdsByItemId[dealId] = []
      }

      customerIdsByItemId[dealId].push(customerId)
    }

    return dealIds.map((id) =>
      (customerIdsByItemId[id] || []).map((customerId) => ({
        __typename: 'Customer',
        _id: customerId,
      })),
    );
  }),

  pipelineByDealId: new DataLoader<string, IPipeline>(async (stageIds) => {
    const pipelineById = {};
    const pipelineByStageId = {};

    const stages = await models.Stages.find({ _id: { $in: stageIds } }).lean();
    const pipelineIds = stages.map(st => st.pipelineId);
    const pipelines = await models.Pipelines.find({ _id: { $in: pipelineIds } }).lean();

    for (const pipeline of pipelines) {
      pipelineById[pipeline._id] = pipeline;
    }

    for (const stage of stages) {
      pipelineByStageId[stage._id] = pipelineById[stage.pipelineId]
    }

    return stageIds.map((stageId) => (pipelineByStageId[stageId]))
  })
});
