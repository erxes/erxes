import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels, IContext, IModels } from './connectionResolver';
import { sendContactsMessage, sendCoreMessage } from './messageBroker';
import { IPos, IPosDocument } from './models/definitions/pos';
import { getConfig } from './utils';

const getChildCategories = async (models: IModels, categories) => {
  let catIds: string[] = [];
  for (const category of categories) {
    const childs = await models.ProductCategories.find({
      order: { $regex: `^${category.order}.*`, $options: 'i' }
    }).sort({ order: 1 });

    catIds = catIds.concat((childs || []).map(ch => ch._id) || []);
  }

  return models.ProductCategories.find({ _id: { $in: catIds } });
};

const getConfigData = async (subdomain, pos: IPosDocument) => {
  const data: any = { pos };

  const userFields = {
    email: 1,
    username: 1,
    password: 1,
    isOwner: 1,
    isActive: 1,
    details: 1
  };

  // qpay configs
  const qpayUrl = await getConfig(subdomain, 'qpayUrl', {});
  const qpayCallbackUrl = await getConfig(subdomain, 'callbackUrl', {});
  const qpayMerchantUser = await getConfig(subdomain, 'qpayMerchantUser', {});
  const qpayMerchantPassword = await getConfig(
    subdomain,
    'qpayMerchantPassword',
    {}
  );
  const qpayInvoiceCode = await getConfig(subdomain, 'qpayInvoiceCode', {});

  if (pos) {
    data.qpayConfig = {
      url: qpayUrl && qpayUrl.value,
      callbackUrl: qpayCallbackUrl && qpayCallbackUrl.value,
      username: qpayMerchantUser && qpayMerchantUser.value,
      password: qpayMerchantPassword && qpayMerchantPassword.value,
      invoiceCode: qpayInvoiceCode && qpayInvoiceCode.value
    };
  }

  // collect admin users
  if (pos.adminIds) {
    data.adminUsers = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $in: pos.adminIds },
          isActive: true
        }
      },
      isRPC: true
    });
  }

  // collect cashiers
  if (pos.cashierIds) {
    data.cashiers = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $in: pos.cashierIds },
          isActive: true
        }
      },
      isRPC: true
    });
  }

  return data;
};

const getProductsData = async (models: IModels, pos: IPosDocument) => {
  const groups = await models.ProductGroups.groups(pos._id);

  const productGroups = [];

  const commonFilter = [
    { status: { $ne: 'disabled' } },
    { status: { $ne: 'archived' } }
  ];

  const resultGroups: any[] = [];
  for (const group of groups) {
    const chosenCategories = await models.ProductCategories.find({
      $and: [{ _id: { $in: group.categoryIds || [] } }, ...commonFilter]
    })
      .sort({ order: 1 })
      .lean();

    const chosenExcludeCategories = await models.ProductCategories.find({
      $and: [{ _id: { $in: group.excludedCategoryIds } }, ...commonFilter]
    }).lean();

    const includeCategories = await getChildCategories(
      models,
      chosenCategories
    );
    const excludeCategories = await getChildCategories(
      models,
      chosenExcludeCategories
    );
    const excludeCatIds = excludeCategories.map(c => c._id);

    const productCategories = includeCategories.filter(
      c => !excludeCatIds.includes(c._id)
    );

    const categories: any[] = [];

    for (const category of productCategories) {
      const products = await models.Products.find({
        status: { $ne: 'deleted' },
        categoryId: category._id,
        _id: { $nin: group.excludedProductIds }
      }).lean();

      categories.push({
        _id: category._id,
        name: category.name,
        description: category.description,
        code: category.code,
        parentId: category.parentId,
        order: category.order,
        attachment: category.attachment,
        products
      });
    }

    resultGroups.push({ ...group, categories });
  } // end product group for loop

  return resultGroups;
};

const getCustomersData = async (subdomain: string) => {
  // consider 'customer' state as valid customers
  return await sendContactsMessage({
    subdomain,
    action: 'customers.findActiveCustomers',
    data: {
      selector: {
        status: { $ne: 'deleted' }
      }
    },
    isRPC: true,
    defaultValue: []
  });
};

export const posInit = async (req, res) => {
  console.log('qqqqqqqqqqq');
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);
  const token = req.headers['pos-token'];
  console.log(subdomain, token);
  const pos = await models.Pos.findOne({ token }).lean();

  const syncId = Math.random().toString();
  const syncInfo = { [syncId]: new Date() };

  await models.Pos.updateOne(
    { _id: pos._id },
    { $set: { syncInfos: { ...pos.syncInfos, ...syncInfo } } }
  );

  const data: any = await getConfigData(models, {
    ...pos,
    syncInfo: { id: syncId, date: syncInfo[syncId] }
  });
  data.productGroups = await getProductsData(models, pos);
  data.customers = await getCustomersData(subdomain);

  return res.send(data);
};

export const posSyncConfig = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const token = req.headers['pos-token'];
  const { syncId, type } = req.body;

  const pos = await models.Pos.findOne({ token }).lean();

  if (!pos) {
    return res.send({ error: 'not found pos' });
  }

  pos.syncInfos[syncId] = new Date();

  await models.Pos.updateOne({ _id: pos._id }, { $set: { ...pos } });

  switch (type) {
    case 'config':
      return res.send(await getConfigData(models, pos));
    case 'products':
      return res.send({ productGroups: await getProductsData(models, pos) });
    case 'customers':
      return res.send({ customers: await getCustomersData(subdomain) });
  }

  return res.send({ error: 'wrong type' });
};

export const posSyncOrders = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const token = req.headers['pos-token'];
  const { syncId, orders, putResponses } = req.body;

  const pos = await models.Pos.findOne({ token }).lean();

  if (!pos) {
    return res.send({ error: 'not found pos' });
  }

  await models.Pos.updateOne(
    { token },
    { $set: { syncInfo: { ...pos.syncInfos, [syncId]: new Date() } } }
  );

  const resOrderIds: any[] = [];
  const putResponseIds: any[] = [];

  try {
    let orderBulkOps: Array<{
      updateOne: {
        filter: { _id: string };
        update: any;
        upsert: true;
      };
    }> = [];

    for (const order of orders) {
      resOrderIds.push(order._id);
      orderBulkOps.push({
        updateOne: {
          filter: { _id: order._id },
          update: {
            $set: { ...order, posToken: token, syncId, branchId: pos.branchId }
          },
          upsert: true
        }
      });
    }

    if (orderBulkOps.length) {
      await models.PosOrders.bulkWrite(orderBulkOps);
    }

    let bulkOps: Array<{
      updateOne: {
        filter: { _id: string };
        update: any;
        upsert: true;
      };
    }> = [];

    for (const putResponse of putResponses) {
      putResponseIds.push(putResponse._id);
      bulkOps.push({
        updateOne: {
          filter: { _id: putResponse._id },
          update: { $set: { ...putResponse, posToken: token, syncId } },
          upsert: true
        }
      });
    }

    if (bulkOps.length) {
      await models.PutResponses.bulkWrite(bulkOps);
    }

    return res.send({ resOrderIds, putResponseIds });
  } catch (e) {
    return res.send({ error: e.message });
  }
};

export const unfetchOrderInfo = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const { orderId, token } = req.body;
  let erkhetConfig = await getConfig(subdomain, 'ERKHET', {});

  if (
    !erkhetConfig ||
    !erkhetConfig.apiToken ||
    erkhetConfig.apiToken !== token
  ) {
    return res.send({ error: 'not found token' });
  }

  const order = await models.PosOrders.findOne({ _id: orderId }).lean();
  if (!order) {
    return res.send({ error: 'not found order' });
  }

  await models.PosOrders.updateOne(
    { _id: orderId },
    { $set: { syncedErkhet: false } }
  );
  return res.send({ status: 'done' });
};
