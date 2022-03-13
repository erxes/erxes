import { getSchemaLabels } from "@erxes/api-utils/src/logUtils";
import { generateModels } from "./connectionResolver";

import { productSchema, productCategorySchema } from './models/definitions/products';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('products:findOne', async ({ subdomain, data } ) => {
    const models = await generateModels(subdomain)
    
    return {
      data: await models.Products.findOne(data),
      status: 'success'
    };
  });

  consumeRPCQueue(
    'products:categories.find',
    async ({ subdomain, data: { query, sort, regData } }) => {
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

  consumeRPCQueue('products:categories.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.ProductCategories.findOne(data),
      status: 'success'
    };
  });

  consumeRPCQueue('products:find', async ({ subdomain, data: { query, sort } }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Products.find(query).sort(sort),
      status: 'success'
    };
  });

  consumeRPCQueue(
    'products:update',
    async ({ subdomain, selector, modifier }) => {
    const models = await generateModels(subdomain)

      return {
        data: await models.Products.updateMany(selector, modifier),
        status: 'success'
      };
    }
  );

  consumeRPCQueue('products:tag', async args => {
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

  consumeRPCQueue('products:generateInternalNoteNotif', async args => {
    const models = await generateModels(args.subdomain)
    const { contentTypeId, notifDoc } = args;

    const product = await models.Products.getProduct({ _id: contentTypeId });

    notifDoc.content = product.name;

    return {
      status: 'success',
      data: notifDoc
    }
  });

  consumeRPCQueue('products:logs.getSchemaLabels', async ({ type }) => ({
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
  return client.sendRPCMessage('forms:prepareCustomFieldsData', data);
};

export const findTags = async (selector): Promise<any> => {
  return client.sendRPCMessage('tags:find', selector);
};

export const findCompanies = async (selector): Promise<any> => {
  return client.sendRPCMessage('contacts:companies.findActiveCompanies', selector);
};

export const findDealProductIds = async (selector): Promise<any> => {
  return client.sendRPCMessage('cards:findDealProductIds', selector);
};

export const updateDeals = async (selector, modifier): Promise<any> => {
  return client.sendRPCMessage('cards:updateDeals', ({ selector, modifier}));
};

export const findCompany = async (selector): Promise<any> => {
  return client.sendRPCMessage('contacts:companies.findCompany', selector);
};

export default function() {
  return client;
}
