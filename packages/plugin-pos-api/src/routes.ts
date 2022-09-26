import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels, IModels } from './connectionResolver';
import {
  sendCoreMessage,
  sendEbarimtMessage,
  sendProductsMessage
} from './messageBroker';
import { IPosDocument } from './models/definitions/pos';
import { getChildCategories, getConfig } from './utils';

export const getConfigData = async (subdomain: string, pos: IPosDocument) => {
  const data: any = { pos };

  // qpay configs
  const qpayConfig = await getConfig(subdomain, 'QPAY', {});

  if (qpayConfig) {
    data.qpayConfig = {
      url: qpayConfig.qpayUrl,
      callbackUrl: pos.isOnline ? qpayConfig.callbackUrl : '',
      username: qpayConfig.qpayMerchantUser,
      password: qpayConfig.qpayMerchantPassword,
      invoiceCode: qpayConfig.qpayInvoiceCode
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

export const getProductsData = async (
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

  if (pos.deliveryConfig && pos.deliveryConfig.productId) {
    const deliveryProd = await sendProductsMessage({
      subdomain,
      action: 'findOne',
      data: {
        _id: pos.deliveryConfig.productId
      },
      isRPC: true
    });
    productGroups.push({
      categories: [
        {
          products: [
            {
              ...deliveryProd
            }
          ]
        }
      ]
    });
  }

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

  const data: any = await getConfigData(subdomain, {
    ...pos
  });
  data.productGroups = await getProductsData(subdomain, models, pos);
  data.posId = pos._id;

  return res.send(data);
};

export const posSyncConfig = async (req, res) => {
  const subdomain = getSubdomain(req);

  const models = await generateModels(subdomain);

  const token = req.headers['pos-token'];
  const { type } = req.body;

  const pos = await models.Pos.findOne({ token }).lean();

  if (!pos) {
    return res.send({ error: 'not found pos' });
  }

  switch (type) {
    case 'config':
      return res.send(await getConfigData(subdomain, pos));
    case 'products':
      return res.send({
        productGroups: await getProductsData(subdomain, models, pos)
      });
    case 'slots':
      return res.send({
        slots: await models.PosSlots.find({ posId: pos._id }).lean()
      });
  }

  return res.send({ error: 'wrong type' });
};

export const posSyncOrders = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const token = req.headers['pos-token'];
  const { orders, putResponses } = req.body;

  const pos = await models.Pos.findOne({ token }).lean();

  if (!pos) {
    return res.send({ error: 'not found pos' });
  }

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
            $set: {
              ...order,
              posToken: token,
              branchId: pos.branchId,
              departmentId: pos.departmentId
            }
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
          update: { $set: { ...putResponse, posToken: token } },
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
