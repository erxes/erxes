import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export const salesReferenceFetchers: TRecordReferencesConfig<IModels>['fetchers'] =
  {
    deal: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return models.Deals.find({ _id: { $in: ids } }).lean();
      }

      return models.Deals.findOne({ _id: id }).lean();
    },

    stage: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return models.Stages.find({ _id: { $in: ids } }).lean();
      }

      return models.Stages.findOne({ _id: id }).lean();
    },

    pipelineLabels: async ({ models, ids }) => {
      return models.PipelineLabels.find({ _id: { $in: ids } }).lean();
    },
  };
