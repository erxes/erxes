import { getSchemaLabels } from "@erxes/api-utils/src/logUtils";
import { generateModels } from "./connectionResolver";

import { productSchema, productCategorySchema } from './models/definitions/products';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('products:rpc_queue:findOne', async (selector) => {
    const models = await generateModels('os')
    
    return {
      data: await models.Products.findOne(selector),
      status: 'success'
    };
  });

  consumeRPCQueue(
    'productCategories:rpc_queue:find',
    async ({ subdomain, query, sort, regData }) => {
      const models = await generateModels(subdomain);

      return {
        data: regData
          ? await models.ProductCategories.find({
              order: { $regex: new RegExp(regData) }
            }).sort(sort)
          : await models.ProductCategories.find(query),
        status: 'success'
      };
    }
  );

  consumeRPCQueue('productCategories:rpc_queue:findOne', async selector => {
    const models = await generateModels('os');

    return {
      data: await models.ProductCategories.findOne(selector),
      status: 'success'
    };
  });

  consumeRPCQueue('products:rpc_queue:find', async ({ query, sort }) => {
    const models = await generateModels('os')

    return {
      data: await models.Products.find(query).sort(sort),
      status: 'success'
    };
  });

  consumeRPCQueue(
    'products:rpc_queue:update',
    async ({ subdomain, selector, modifier }) => {
    const models = await generateModels(subdomain)

      return {
        data: await models.Products.updateMany(selector, modifier),
        status: 'success'
      };
    }
  );

  consumeRPCQueue('products:rpc_queue:tag', async args => {
    const models = await generateModels(args.subdomain)

    let data = {};

    if (args.action === 'count') {
      data = await models.Products.countDocuments({ tagIds: { $in: args._ids } });
    }

    if (args.action === 'tagObject') {
      await models.Products.updateMany(
        { _id: { $in: args.targetIds } },
        { $set: { tagIds: args.tagIds } },
        { multi: true }
      );

      data = await models.Products.find({ _id: { $in: args.targetIds } }).lean();
    }

    return {
      status: 'success',
      data
    }
  });

  consumeRPCQueue('products:rpc_queue:generateInternalNoteNotif', async args => {
    const models = await generateModels(args.subdomain)
    const { contentTypeId, notifDoc } = args;

    const product = await models.Products.getProduct({ _id: contentTypeId });

    notifDoc.content = product.name;

    return {
      status: 'success',
      data: notifDoc
    }
  });

  consumeRPCQueue('products:logs:getSchemaLabels', async ({ type }) => ({
    status: 'success',
    data: getSchemaLabels(
      type,
      [{ name: 'product', schemas: [productSchema] }, { name: 'productCategory', schemas: [productCategorySchema] }]
    )
  }));
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const prepareCustomFieldsData = async (data): Promise<any> => {
  return client.sendRPCMessage('forms:rpc_queue:prepareCustomFieldsData', data);
};

export const findTags = async (selector): Promise<any> => {
  return client.sendRPCMessage('tags:rpc_queue:find', selector);
};

export const findCompanies = async (selector): Promise<any> => {
  return client.sendRPCMessage('contacts:rpc_queue:findActiveCompanies', selector);
};

export const findDealProductIds = async (selector): Promise<any> => {
  return client.sendRPCMessage('cards:rpc_queue:findDealProductIds', selector);
};

export const updateDeals = async (selector, modifier): Promise<any> => {
  return client.sendRPCMessage('cards:rpc_queue:updateDeals', ({ selector, modifier}));
};

export const findCompany = async (selector): Promise<any> => {
  return client.sendRPCMessage('contacts:rpc_queue:findCompany', selector);
};

export default function() {
  return client;
}
