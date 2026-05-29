import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export const coreReferenceFetchers: TRecordReferencesConfig<IModels>['fetchers'] =
  {
    customer: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return models.Customers.find({ _id: { $in: ids } }).lean();
      }

      return models.Customers.findOne({ _id: id }).lean();
    },

    company: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return models.Companies.find({ _id: { $in: ids } }).lean();
      }

      return models.Companies.findOne({ _id: id }).lean();
    },

    product: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return models.Products.find({ _id: { $in: ids } }).lean();
      }

      return models.Products.findOne({ _id: id }).lean();
    },

    tag: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return models.Tags.find({ _id: { $in: ids } }).lean();
      }

      return models.Tags.findOne({ _id: id }).lean();
    },

    user: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return models.Users.find({ _id: { $in: ids } }).lean();
      }

      return models.Users.findOne({ _id: id }).lean();
    },

    branch: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return models.Branches.find({ _id: { $in: ids } }).lean();
      }

      return models.Branches.findOne({ _id: id }).lean();
    },

    department: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return models.Departments.find({ _id: { $in: ids } }).lean();
      }

      return models.Departments.findOne({ _id: id }).lean();
    },
  };
