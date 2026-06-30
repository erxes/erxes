import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export const salesReferenceFetchers: TRecordReferencesConfig<IModels>['fetchers'] =
  {
    deal: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return await models.Deals.find({ _id: { $in: ids } }).lean();
      }

      return await models.Deals.findOne({ _id: id }).lean();
    },

    stage: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return await models.Stages.find({ _id: { $in: ids } }).lean();
      }

      return await models.Stages.findOne({ _id: id }).lean();
    },

    pipelineLabels: async ({ models, ids }) => {
      return await models.PipelineLabels.find({ _id: { $in: ids } }).lean();
    },
  };
