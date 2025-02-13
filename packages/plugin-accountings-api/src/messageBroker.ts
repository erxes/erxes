import {
  MessageArgs,
  MessageArgsOmitService,
  escapeRegExp,
  sendMessage,
} from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';

export const setupMessageConsumers = async () => {
  consumeRPCQueue(
    'accountings:accounts.findOne',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Accounts.findOne(data).lean(),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'accountings:categories.find',
    async ({ subdomain, data: { query, sort, regData } }) => {
      const models = await generateModels(subdomain);

      return {
        data: regData
          ? await models.AccountCategories.find({
            ...query,
            order: { $regex: new RegExp(regData) },
          }).sort(sort)
          : await models.AccountCategories.find(query).sort(sort).lean(),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'accountings:categories.withChilds',
    async ({ subdomain, data: { _id, ids } }) => {
      const models = await generateModels(subdomain);
      const categoryIds = _id ? [_id] : ids || [];
      if (!categoryIds.length) {
        return {
          data: [],
          status: 'success',
        };
      }

      const categories = await models.AccountCategories.find({
        _id: { $in: categoryIds },
      }).lean();

      if (!categories.length) {
        return {
          data: [],
          status: 'success',
        };
      }

      const orderQry: any[] = [];
      for (const category of categories) {
        orderQry.push({
          order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) },
        });
      }

      return {
        data: await models.AccountCategories.find({
          status: { $nin: ['disabled', 'archived'] },
          $or: orderQry,
        })
          .sort({ order: 1 })
          .lean(),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'accountings:categories.findOne',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      return {
        data: await models.AccountCategories.findOne(data).lean(),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'accountings:categories.updateAccountCategory',
    async ({ subdomain, data: { _id, doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.AccountCategories.updateAccountCategory(_id, doc),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'accountings:categories.createAccountCategory',
    async ({ subdomain, data: { doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.AccountCategories.createAccountCategory(doc),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'accountings:categories.removeAccountCategory',
    async ({ subdomain, data: { _id } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.AccountCategories.removeAccountCategory(_id),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'accountings:accounts.find',
    async ({
      subdomain,
      data: { query, sort, skip, limit, categoryId, categoryIds, fields },
    }) => {
      const models = await generateModels(subdomain);

      if (!query) {
        query = {};
      }

      if (categoryIds?.length > 0) {
        const categories = await models.AccountCategories.find({
          _id: { $in: categoryIds },
        }).lean();

        const orderQry: any[] = [];

        for (const category of categories) {
          orderQry.push({
            order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) },
          });
        }

        const categoriesWithChildren = await models.AccountCategories.find({
          status: { $nin: ['disabled', 'archived'] },
          $or: orderQry,
        }).lean();

        query.categoryId = {
          $in: categoriesWithChildren.map((category) => category._id),
        };
      }

      if (categoryId) {
        const category = await models.AccountCategories.findOne({
          _id: categoryId,
        }).lean();

        if (category) {
          const categories = await models.AccountCategories.find({
            order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) },
          }).lean();
          query.categoryId = { $in: categories.map((c) => c._id) };
        }

      }

      return {
        data: await models.Accounts.find(query, fields || {})
          .sort(sort)
          .skip(skip || 0)
          .limit(limit || 0)
          .lean(),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'accountings:accounts.count',
    async ({ subdomain, data: { query, categoryId } }) => {
      const models = await generateModels(subdomain);

      const filter = { ...(query || {}) };
      if (categoryId) {
        const category = await models.AccountCategories.findOne({
          _id: categoryId,
        }).lean();
        if (category) {
          const categories = await models.AccountCategories.find({
            order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) },
          }).lean();

          filter.categoryId = { $in: categories.map((c) => c._id) };
        }
      }

      return {
        data: await models.Accounts.find(filter).countDocuments(),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'accountings:categories.count',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.AccountCategories.find(query).countDocuments(),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'accountings:accounts.createAccount',
    async ({ subdomain, data: { doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Accounts.createAccount(doc),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'accountings:accounts.updateAccount',
    async ({ subdomain, data: { _id, doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Accounts.updateAccount(_id, doc),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'accountings:accounts.removeAccounts',
    async ({ subdomain, data: { _ids } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Accounts.removeAccounts(_ids),
        status: 'success',
      };
    },
  );

  consumeQueue(
    'accountings:accounts.update',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Accounts.updateMany(selector, modifier),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'accountings:accountingsConfigs.getConfig',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const { code, defaultValue } = data;

      return {
        status: 'success',
        data: await models.AccountingConfigs.getConfig(code, defaultValue),
      };
    },
  );
};

export const sendFormsMessage = (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendProcessesMessage = (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'processes',
    ...args,
  });
};

export const sendContactsMessage = (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendSegmentsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const getConfig = async (subdomain: string, code: string, defaultValue?: any) => {
  return sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true
  });
}

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};

export const fetchSegment = (
  subdomain: string,
  segmentId: string,
  options?,
  segmentData?: any,
) =>
  sendSegmentsMessage({
    subdomain,
    action: 'fetchSegment',
    data: { segmentId, options, segmentData },
    isRPC: true,
  });
