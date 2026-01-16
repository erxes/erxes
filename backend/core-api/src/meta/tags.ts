import { generateModels, IModels } from '../connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

const modelChanger = (type: string, models: IModels) => {
  if (type === 'customer') {
    return models.Customers;
  }

  if (type === 'product') {
    return models.Products;
  }

  return models.Companies;
};

export const tags = {
  types: [
    {
      description: 'Customer',
      type: 'customer',
    },
    {
      description: 'Company',
      type: 'company',
    },
    {
      description: 'Product & Service',
      type: 'product',
    },
    {
      description: 'Form',
      type: 'form',
    },
  ],
  tag: async ({ subdomain, data }) => {
    const { type, action, _ids, tagIds, targetIds } = data;
    const [pluginName, moduleName] = type.split(':');

    if (!moduleName || pluginName === 'core') {
      const models = await generateModels(subdomain);
      const model: any = modelChanger(type, models);

      if (action === 'count') {
        return model.countDocuments({ tagIds: { $in: _ids } });
      }

      if (action === 'tagObject') {
        await model.updateMany(
          { _id: { $in: targetIds } },
          { $set: { tagIds } },
          { multi: true },
        );

        return model.find({ _id: { $in: targetIds } }).lean();
      }
      return {};
    }

    if (action === 'tagObject') {
      return await sendTRPCMessage({
        subdomain,
        pluginName,
        method: 'mutation',
        module: moduleName,
        action: 'tag',
        input: {
          tagIds,
          targetIds,
          type: moduleName,
          action: 'tagObject',
        },
        defaultValue: [],
      });
    }

    return {};
  },
  fixRelatedItems: async ({
    subdomain,
    data: { sourceId, destId, type, action },
  }) => {
    const models = await generateModels(subdomain);
    const model: any = modelChanger(type, models);

    if (action === 'remove') {
      await model.updateMany(
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: { $in: [sourceId] } } },
      );
    }

    if (action === 'merge') {
      const itemIds = await model
        .find({ tagIds: { $in: [sourceId] } }, { _id: 1 })
        .distinct('_id');

      // add to new destination
      await model.updateMany(
        { _id: { $in: itemIds } },
        { $set: { 'tagIds.$[elem]': destId } },
        { arrayFilters: [{ elem: { $eq: sourceId } }] },
      );
    }
  },
};
