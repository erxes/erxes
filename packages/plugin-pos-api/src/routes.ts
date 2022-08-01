import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels, IModels } from './connectionResolver';
import {
  sendContactsMessage,
  sendCoreMessage,
  sendEbarimtMessage,
  sendProductsMessage
} from './messageBroker';
import { IPosDocument } from './models/definitions/pos';
import { getChildCategories, getConfig } from './utils';

const getConfigData = async (
  subdomain: string,
  models: IModels,
  pos: IPosDocument
) => {
  const data: any = { pos };

  // qpay configs
  const qpayUrl = await getConfig(subdomain, 'qpayUrl', {});
  console.log('oooooooooooooooooooooo', qpayUrl);
  if (qpayUrl) {
    const qpayCallbackUrl = await getConfig(subdomain, 'callbackUrl', {});
    const qpayMerchantUser = await getConfig(subdomain, 'qpayMerchantUser', {});
    const qpayMerchantPassword = await getConfig(
      subdomain,
      'qpayMerchantPassword',
      {}
    );
    const qpayInvoiceCode = await getConfig(subdomain, 'qpayInvoiceCode', {});

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

  data.slots = await models.PosSlots.find({ posId: pos._id }).lean();

  return data;
};

const getProductsData = async (
  subdomain: string,
  models: IModels,
  pos: IPosDocument
) => {
  const groups = await models.ProductGroups.groups(pos._id);

  const productGroups: any = [];

  for (const group of groups) {
    const includeCatIds = await getChildCategories(
      subdomain,
      group.categoryIds
    );
    const excludeCatIds = await getChildCategories(
      subdomain,
      group.excludedCategoryIds
    );

    const productCategoryIds = includeCatIds.filter(
      c => !excludeCatIds.includes(c)
    );

    const productCategories = await sendProductsMessage({
      subdomain,
      action: 'categories.find',
      data: { query: { _id: { $in: productCategoryIds } }, sort: { order: 1 } },
      isRPC: true,
      defaultValue: []
    });

    const categories: any[] = [];

    for (const category of productCategories) {
      const products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          query: {
            status: { $ne: 'deleted' },
            categoryId: category._id,
            _id: { $nin: group.excludedProductIds }
          }
        },
        isRPC: true,
        defaultValue: []
      });

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

    productGroups.push({ ...group, categories });
  } // end product group for loop

  return productGroups;
};

export const posInit = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);
  const token = req.headers['pos-token'];
  const pos = await models.Pos.findOne({ token }).lean();

  if (!pos) {
    return res.send({ error: 'Not found POS by token' });
  }

  const syncId = Math.random().toString();
  const syncInfo = { [syncId]: new Date() };

  await models.Pos.updateOne(
    { _id: pos._id },
    { $set: { syncInfos: { ...pos.syncInfos, ...syncInfo } } }
  );

  const data: any = await getConfigData(subdomain, models, {
    ...pos,
    syncInfo: { id: syncId, date: syncInfo[syncId] }
  });
  data.productGroups = await getProductsData(subdomain, models, pos);
  data.posId = pos._id;

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
      return res.send(await getConfigData(subdomain, models, pos));
    case 'products':
      return res.send({
        productGroups: await getProductsData(subdomain, models, pos)
      });
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
      await sendEbarimtMessage({
        subdomain,
        action: 'putresponses.bulkWrite',
        data: {
          bulkOps
        }
      });
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
