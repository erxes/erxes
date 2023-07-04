import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

  consumeRPCQueue('accounts:findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Accounts.findOne(data).lean(),
      status: 'success'
    };
  });

  consumeRPCQueue(
    'accounts:categories.find',
    async ({ subdomain, data: { query, sort, regData } }) => {
      const models = await generateModels(subdomain);

      return {
        data: regData
          ? await models.AccountCategories.find({
              ...query,
              order: { $regex: new RegExp(regData) }
            }).sort(sort)
          : await models.AccountCategories.find(query)
              .sort(sort)
              .lean(),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'accounts:categories.withChilds',
    async ({ subdomain, data: { _id, ids } }) => {
      const models = await generateModels(subdomain);
      const categoryIds = _id ? [_id] : ids || [];
      if (!categoryIds.length) {
        return {
          data: [],
          status: 'success'
        };
      }

      const categories = await models.AccountCategories.find({
        _id: { $in: categoryIds }
      }).lean();

      if (!categories.length) {
        return {
          data: [],
          status: 'success'
        };
      }

      const orderQry: any[] = [];
      for (const category of categories) {
        orderQry.push({
          order: { $regex: new RegExp(category.order) }
        });
      }

      return {
        data: await models.AccountCategories.find({
          status: { $nin: ['disabled', 'archived'] },
          $or: orderQry
        })
          .sort({ order: 1 })
          .lean(),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'accounts:categories.findOne',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      return {
        data: await models.AccountCategories.findOne(data).lean(),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'accounts:categories.updateAccountCategory',
    async ({ subdomain, data: { _id, doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.AccountCategories.updateAccountCategory(_id, doc),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'accounts:categories.createAccountCategory',
    async ({ subdomain, data: { doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.AccountCategories.createAccountCategory(doc),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'accounts:categories.removeAccountCategory',
    async ({ subdomain, data: { _id } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.AccountCategories.removeAccountCategory(_id),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'accounts:find',
    async ({
      subdomain,
      data: { query, sort, skip, limit, categoryId, fields }
    }) => {
      const models = await generateModels(subdomain);

      if (!query) {
        query = {};
      }

      if (categoryId) {
        const category = await models.AccountCategories.findOne({
          _id: categoryId
        }).lean();
        const categories = await models.AccountCategories.find({
          order: { $regex: new RegExp(category.order) }
        }).lean();

        query.categoryId = { $in: categories.map(c => c._id) };
      }

      return {
        data: await models.Accounts.find(query, fields || {})
          .sort(sort)
          .skip(skip || 0)
          .limit(limit || 10000)
          .lean(),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'accounts:count',
    async ({ subdomain, data: { query, categoryId } }) => {
      const models = await generateModels(subdomain);

      const filter = { ...(query || {}) };
      if (categoryId) {
        const category = await models.AccountCategories.findOne({
          _id: categoryId
        }).lean();
        const categories = await models.AccountCategories.find({
          order: { $regex: new RegExp(category.order) }
        }).lean();

        filter.categoryId = { $in: categories.map(c => c._id) };
      }

      return {
        data: await models.Accounts.find(filter).count(),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'accounts:categories.count',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.AccountCategories.find(query).countDocuments(),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'accounts:createAccount',
    async ({ subdomain, data: { doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Accounts.createAccount(doc),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'accounts:updateAccount',
    async ({ subdomain, data: { _id, doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Accounts.updateAccount(_id, doc),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'accounts:removeAccounts',
    async ({ subdomain, data: { _ids } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Accounts.removeAccounts(_ids),
        status: 'success'
      };
    }
  );

  consumeQueue(
    'accounts:update',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Accounts.updateMany(selector, modifier),
        status: 'success'
      };
    }
  );

  consumeRPCQueue('accounts:tag', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    let response = {};

    if (data.action === 'count') {
      response = await models.Accounts.countDocuments({
        tagIds: { $in: data._ids }
      });
    }

    if (data.action === 'tagObject') {
      await models.Accounts.updateMany(
        { _id: { $in: data.targetIds } },
        { $set: { tagIds: data.tagIds } },
        { multi: true }
      );

      response = await models.Accounts.find({
        _id: { $in: data.targetIds }
      }).lean();
    }

    return {
      status: 'success',
      data: response
    };
  });

  consumeRPCQueue(
    'accounts:generateInternalNoteNotif',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const { contentTypeId, notifDoc } = data;

      const account = await models.Accounts.getAccount({ _id: contentTypeId });

      notifDoc.content = account.name;

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

export const sendProcessesMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'processes',
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

export const sendSegmentsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'segments',
    ...args
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export const fetchSegment = (
  subdomain: string,
  segmentId: string,
  options?,
  segmentData?: any
) =>
  sendSegmentsMessage({
    subdomain,
    action: 'fetchSegment',
    data: { segmentId, options, segmentData },
    isRPC: true
  });

export default function() {
  return client;
}
