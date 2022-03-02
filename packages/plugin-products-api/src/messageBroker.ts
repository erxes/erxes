import { getSchemaLabels } from "@erxes/api-utils/src/logUtils";

import { ProductCategories, Products } from "./models";
import { productSchema, productCategorySchema } from './models/definitions/products';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('products:rpc_queue:findOne', async (selector) => ({
    data: await Products.findOne(selector),
    status: 'success',
  }));

  consumeRPCQueue(
    'productCategories:rpc_queue:find',
    async ({ query, sort, regData }) => ({
        data: regData
          ? await ProductCategories.find({
              order: { $regex: new RegExp(regData) }
            }).sort(sort)
          : await ProductCategories.find(query),
        status: 'success'
      })
  );

  consumeRPCQueue('productCategories:rpc_queue:findOne', async (selector) => ({
    data: await ProductCategories.findOne(selector),
    status: 'success',
  }));

  consumeRPCQueue('products:rpc_queue:find', async ({ query, sort }) => ({
    data: await Products.find(query).sort(sort),
    status: 'success',
  }));

  consumeRPCQueue('products:rpc_queue:update', async ({ selector, modifier }) => ({
    data: await Products.updateMany(selector, modifier),
    status: 'success',
  }));

  consumeRPCQueue('products:rpc_queue:tag', async args => {
    let data = {};

    if (args.action === 'count') {
      data = await Products.countDocuments({ tagIds: { $in: args._ids } });
    }

    if (args.action === 'tagObject') {
      await Products.updateMany(
        { _id: { $in: args.targetIds } },
        { $set: { tagIds: args.tagIds } },
        { multi: true }
      );

      data = await Products.find({ _id: { $in: args.targetIds } }).lean();
    }

    return {
      status: 'success',
      data
    }
  });

  consumeRPCQueue('products:rpc_queue:generateInternalNoteNotif', async args => {
    const { contentTypeId, notifDoc } = args;

    const product = await Products.getProduct({ _id: contentTypeId });

    notifDoc.content = product.name;

    return {
      status: 'success',
      data: notifDoc
    }
  });

  consumeRPCQueue('products:rpc_queue:logs:getSchemaLabels', async ({ type }) => ({
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

export const prepareCustomFieldsData = async (doc): Promise<any> => {
  return client.sendRPCMessage('fields:rpc_queue:prepareCustomFieldsData', {
    doc,
  });
};

export const findTags = async (selector): Promise<any> => {
  return client.sendRPCMessage('tags:rpc_queue:find', selector);
};

export const findCompanies = async (selector): Promise<any> => {
  return client.sendRPCMessage('contacts:rpc_queue:findActiveCompanies', selector);
};

export default function() {
  return client;
}
