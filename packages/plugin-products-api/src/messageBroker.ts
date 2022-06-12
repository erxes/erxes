import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

  consumeRPCQueue('products:findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Products.findOne(data).lean(),
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
          : await models.ProductCategories.find(query).lean(),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'products:categories.withChilds',
    async ({ subdomain, data: { _id } }) => {
      const models = await generateModels(subdomain);
      const category = await models.ProductCategories.findOne({ _id }).lean();

      return {
        data: await models.ProductCategories.find({
          order: { $regex: new RegExp(category.order) }
        })
          .sort({ order: 1 })
          .lean(),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'products:categories.findOne',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      return {
        data: await models.ProductCategories.findOne(data).lean(),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'products:categories.updateProductCategory',
    async ({ subdomain, data: { _id, doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ProductCategories.updateProductCategory(_id, doc),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'products:categories.createProductCategory',
    async ({ subdomain, data: { doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ProductCategories.createProductCategory(doc),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'products:categories.removeProductCategory',
    async ({ subdomain, data: { _id } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ProductCategories.removeProductCategory(_id),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'products:find',
    async ({ subdomain, data: { query, sort, skip, limit, categoryId } }) => {
      const models = await generateModels(subdomain);

      if (categoryId) {
        const category = await models.ProductCategories.findOne({
          _id: categoryId
        }).lean();
        const categories = await models.ProductCategories.find({
          order: { $regex: new RegExp(category.order) }
        }).lean();

        query.categoryId = { $in: categories.map(c => c._id) };
      }

      return {
        data: await models.Products.find(query)
          .sort(sort)
          .skip(skip || 0)
          .limit(limit || 100)
          .lean(),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'products:find',
    async ({ subdomain, data: { query, sort, skip, limit } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Products.find(query)
          .sort(sort)
          .skip(skip || 0)
          .limit(limit || 100)
          .lean(),
        status: 'success'
      };
    }
  );

  consumeRPCQueue('products:count', async ({ subdomain, data: { query } }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Products.find(query).countDocuments(),
      status: 'success'
    };
  });

  consumeRPCQueue(
    'products:createProduct',
    async ({ subdomain, data: { doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Products.createProduct(doc),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'products:updateProduct',
    async ({ subdomain, data: { _id, doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Products.updateProduct(_id, doc),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'products:removeProducts',
    async ({ subdomain, data: { _ids } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Products.removeProducts(_ids),
        status: 'success'
      };
    }
  );

  consumeQueue(
    'products:update',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Products.updateMany(selector, modifier),
        status: 'success'
      };
    }
  );

  consumeRPCQueue('products:tag', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    let response = {};

    if (data.action === 'count') {
      response = await models.Products.countDocuments({
        tagIds: { $in: data._ids }
      });
    }

    if (data.action === 'tagObject') {
      await models.Products.updateMany(
        { _id: { $in: data.targetIds } },
        { $set: { tagIds: data.tagIds } },
        { multi: true }
      );

      response = await models.Products.find({
        _id: { $in: data.targetIds }
      }).lean();
    }

    return {
      status: 'success',
      data: response
    };
  });

  consumeRPCQueue(
    'products:generateInternalNoteNotif',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const { contentTypeId, notifDoc } = data;

      const product = await models.Products.getProduct({ _id: contentTypeId });

      notifDoc.content = product.name;

      return {
        status: 'success',
        data: notifDoc
      };
    }
  );
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const sendFormsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'forms',
    ...args
  });
};

export const sendCardsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'cards',
    ...args
  });
};

export const sendContactsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendTagsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'tags',
    ...args
  });
};

export default function() {
  return client;
}
