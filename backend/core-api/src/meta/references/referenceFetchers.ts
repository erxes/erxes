import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';
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

    branch: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return await models.Branches.find({ _id: { $in: ids } }).lean();
      }

      return await models.Branches.findOne({ _id: id }).lean();
    },

    department: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return await models.Departments.find({ _id: { $in: ids } }).lean();
      }

      return await models.Departments.findOne({ _id: id }).lean();
    },
  };
