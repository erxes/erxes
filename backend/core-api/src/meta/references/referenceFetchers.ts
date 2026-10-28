import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';
import { withoutPermissionScope } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export const coreReferenceFetchers: TRecordReferencesConfig<IModels>['fetchers'] =
  {
    customer: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return await models.Customers.find({ _id: { $in: ids } }).lean();
      }

      return await models.Customers.findOne({ _id: id }).lean();
    },

    company: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return await models.Companies.find({ _id: { $in: ids } }).lean();
      }

      return await models.Companies.findOne({ _id: id }).lean();
    },

    product: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return await models.Products.find({ _id: { $in: ids } }).lean();
      }

      return await models.Products.findOne({ _id: id }).lean();
    },

    tag: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return await models.Tags.find({ _id: { $in: ids } }).lean();
      }

      return await models.Tags.findOne({ _id: id }).lean();
    },

    user: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return await models.Users.find({ _id: { $in: ids } }).lean();
      }

      return await models.Users.findOne({ _id: id }).lean();
    },

    structureEntity: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return await withoutPermissionScope(() =>
          models.StructureEntities.find({ _id: { $in: ids } }).lean(),
        );
      }

      return await withoutPermissionScope(() =>
        models.StructureEntities.findOne({ _id: id }).lean(),
      );
    },
  };
