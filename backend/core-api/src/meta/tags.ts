import { generateModels, IModels } from '../connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { taggableTarget } from '@/tags/taggable';

const modelChanger = (type: string, models: IModels) => {
  const record = type.includes(':') ? type.split(':')[1] : type;

  return {
    customer: models.Customers,
    company: models.Companies,
    product: models.Products,
    user: models.Users,
    form: models.Forms,
    automation: models.Automations,
  }[record];
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
  ],
  tag: async ({ subdomain, data }) => {
    const { type, action, _ids, tagIds, targetIds } = data;
    const [pluginName, moduleName] = type.split(':');

    if (!moduleName || pluginName === 'core') {
      const models = await generateModels(subdomain);
      const model: any = modelChanger(type, models);
      const record = type.includes(':') ? type.split(':')[1] : type;

      if (!model || !taggableTarget(record)) {
        throw new Error(`Unknown content type: ${type}`);
      }

      if (action === 'count') {
        return model.countDocuments({ tagIds: { $in: _ids } });
      }

      if (action === 'tagObject') {
        await models.Tags.tagsTag(`core:${record}`, targetIds, tagIds);

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

    await models.Tags.fixRelatedRecords({ type, sourceId, destId, action });
  },
};
