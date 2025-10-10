import { getSubdomain, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels, generateModels } from '~/connectionResolvers';
import { IPosDocument } from './@types/pos';
import { USER_FIELDS } from './db/definitions/constants';
import { calcProductsTaxRule, getChildCategories, getConfig } from './utils';

export const getConfigData = async (subdomain: string, pos: IPosDocument) => {
  const data: any = { pos };

  // collect admin users
  if (pos.adminIds) {
    data.adminUsers = await sendTRPCMessage({
      pluginName: 'core',
      module: 'users',
      action: 'find',
      input: {
        query: {
          _id: { $in: pos.adminIds },
          isActive: true,
        },
        fields: USER_FIELDS,
      },
    });
  }

  // collect cashiers
  if (pos.cashierIds) {
    data.cashiers = await sendTRPCMessage({
      pluginName: 'core',
      module: 'users',
      action: 'find',
      input: {
        query: {
          _id: { $in: pos.cashierIds },
          isActive: true,
        },
        fields: USER_FIELDS,
      },
    });
  }

  if (pos.erkhetConfig && pos.erkhetConfig.isSyncErkhet) {
    const configs = await getConfig('ERKHET', {});

    data.pos.erkhetConfig = {
      ...pos.erkhetConfig,
      getRemainderApiUrl: configs.getRemainderApiUrl,
      apiKey: configs.apiKey,
      apiSecret: configs.apiSecret,
      apiToken: configs.apiToken,
    };
  }

  return data;
};

export const getProductsData = async (
  subdomain: string,
  models: IModels,
  pos: IPosDocument,
) => {
  const groups = await models.ProductGroups.groups(pos._id);

  let checkExcludeCategoryIds: string[] = [];
  if (pos.isCheckRemainder && pos.checkExcludeCategoryIds.length) {
    checkExcludeCategoryIds = await getChildCategories(
      subdomain,
      pos.checkExcludeCategoryIds,
    );
  }

  const productGroups: any = [];

  for (const group of groups) {
    const includeCatIds = await getChildCategories(
      subdomain,
      group.categoryIds,
    );
    const excludeCatIds = await getChildCategories(
      subdomain,
      group.excludedCategoryIds,
    );

    const productCategoryIds = includeCatIds.filter(
      (c) => !excludeCatIds.includes(c),
    );

    const productCategories = await sendTRPCMessage({
      pluginName: 'core',
      module: 'productCategories',
      action: 'find',
      input: {
        query: { _id: { $in: productCategoryIds } },
        sort: { order: 1 },
      },
      defaultValue: [],
    });
    const categories: any[] = [];

    for (const category of productCategories) {
      categories.push({
        _id: category._id,
        name: category.name,
        description: category.description,
        code: category.code,
        parentId: category.parentId,
        order: category.order,
        attachment: category.attachment,
        meta: category.meta,
        isSimilarity: category.isSimilarity,
        similarities: category.similarities,
      });
    }

    const categoryIds = categories.map((cat) => cat._id);
    const productsByCatId = {};

    const products: any[] = await sendTRPCMessage({
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: {
        query: {
          status: { $ne: 'deleted' },
          categoryId: { $in: categoryIds },
          _id: { $nin: group.excludedProductIds },
        },
      },
      defaultValue: [],
    });

    const productsById = await calcProductsTaxRule(
      subdomain,
      pos.ebarimtConfig,
      products,
    );

    const pricing = await sendTRPCMessage({
      pluginName: 'loyalty',
      module: 'pricing',
      action: 'checkPricing',
      input: {
        prioritizeRule: 'only',
        totalAmount: 0,
        departmentId: pos.departmentId,
        branchId: pos.branchId,
        products: products.map((p) => ({
          itemId: p._id,
          productId: p._id,
          quantity: 1,
          price: p.unitPrice,
        })),
      },
      // timeout: 290000
      defaultValue: {},
    });

    for (const productId of Object.keys(productsById)) {
      const product = productsById[productId];

      const discount = pricing[productId] || {};

      if (Object.keys(discount).length) {
        product.unitPrice -= discount.value;
        if (product.unitPrice < 0) {
          product.unitPrice = 0;
        }
      }

      if (
        pos.isCheckRemainder &&
        !checkExcludeCategoryIds.includes(product.categoryId)
      ) {
        product.isCheckRem = true;
      } else {
        product.isCheckRem = false;
      }

      if (!Object.keys(productsByCatId).includes(product.categoryId)) {
        productsByCatId[product.categoryId] = [];
      }

      productsByCatId[product.categoryId].push(product);
    }

    productGroups.push({
      ...group,
      categories: categories.map((category) => ({
        ...category,
        products: productsByCatId[category._id] || [],
      })),
    });
  } // end product group for loop

  const followProductIds: string[] = [];

  if (pos.deliveryConfig && pos.deliveryConfig.productId) {
    followProductIds.push(pos.deliveryConfig.productId);
  }

  if (pos.catProdMappings && pos.catProdMappings.length) {
    for (const map of pos.catProdMappings) {
      if (!followProductIds.includes(map.productId)) {
        followProductIds.push(map.productId);
      }
    }
  }

  if (followProductIds.length) {
    const followProducts = await sendTRPCMessage({
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: { query: { _id: { $in: followProductIds } } },
      defaultValue: [],
    });

    productGroups.push({
      categories: [
        {
          products: followProducts,
        },
      ],
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
    ...pos,
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
        productGroups: await getProductsData(subdomain, models, pos),
      });
    case 'slots':
      return res.send({
        slots: await models.PosSlots.find({ posId: pos._id }).lean(),
      });
    case 'productsConfigs':
      return res.send(
        await sendTRPCMessage({
          pluginName: 'core',
          module: 'productConfigs',
          action: 'getConfig',
          input: { code: 'similarityGroup', defaultValue: {} },
        }),
      );
  }

  return res.send({ error: 'wrong type' });
};

export const unfetchOrderInfo = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const { orderId, token } = req.body;
  const erkhetConfig = await getConfig('ERKHET', {});

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
    { $set: { syncedErkhet: false } },
  );
  return res.send({ status: 'done' });
};
