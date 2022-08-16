import { IModels } from '../../connectionResolver';
import { IPosUserDocument } from '../../models/definitions/posUsers';
import { IConfig, IConfigDocument } from '../../models/definitions/configs';
import { getService } from '@erxes/api-utils/src/serviceDiscovery';
import {
  PRODUCT_CATEGORY_STATUSES,
  PRODUCT_STATUSES
} from '../../models/definitions/constants';

export const getServerAddress = async (
  subdomain: string,
  serviceName?: string
) => {
  const { SERVER_DOMAIN } = process.env;
  if (SERVER_DOMAIN) {
    return `${SERVER_DOMAIN.replace(
      '<subdomain>',
      subdomain
    )}/pl:${serviceName || 'pos'}`;
  }

  const posService = await getService(serviceName || 'pos');

  if (!posService.address) {
    return `http://localhost:4000/pl:${serviceName || 'pos'}`;
  }

  return posService.address;
};

export const importUsers = async (
  models: IModels,
  users: IPosUserDocument[],
  token: string,
  isAdmin: boolean = false
) => {
  for (const user of users) {
    await models.PosUsers.createOrUpdateUser(
      {
        _id: user._id,
        username: user.username,
        email: user.email,
        password: user.password,
        isOwner: user.isOwner || isAdmin,
        isActive: user.isActive,
        details: user.details
      },
      token
    );
  }
};

export const importSlots = async (models: IModels, slots: any[]) => {
  await models.PosSlots.deleteMany({});
  await models.PosSlots.insertMany(slots);
};

export const preImportProducts = async (
  models: IModels,
  token: string,
  groups: any
) => {
  let importProductIds: string[] = [];
  const importProductCatIds: string[] = [];
  const oldAllProducts = await models.Products.find(
    { tokens: { $in: [token] } },
    { _id: 1, tokens: 1 }
  ).lean();

  const oldProductIds = (oldAllProducts || []).map(p => p._id);
  const oldAllProductCats = await models.ProductCategories.find(
    { tokens: { $in: [token] } },
    { _id: 1, tokens: 1 }
  ).lean();

  const oldCategoryIds = (oldAllProductCats || []).map(p => p._id);

  for (const group of groups) {
    const categories = group.categories || [];

    for (const category of categories) {
      importProductCatIds.push(category._id);
      importProductIds = importProductIds.concat(
        (category.products || []).map(p => p._id)
      );
    }
  } // end group loop

  const removeProductIds = oldProductIds.filter(
    id => !importProductIds.includes(id)
  );

  await models.Products.updateMany(
    { _id: { $in: removeProductIds } },
    { $pull: { tokens: { $in: [token] } } }
  );

  const removeCategoryIds =
    oldCategoryIds.filter(id => !importProductCatIds.includes(id)) || [];

  await models.ProductCategories.updateMany(
    { _id: { $in: removeCategoryIds } },
    { $pull: { tokens: { $in: [token] } } }
  );

  const deleteProductIds = await models.Products.find(
    { $or: [{ tokens: { $exists: false } }, { tokens: [] }] },
    { _id: 1 }
  ).lean();
  await models.Products.removeProducts(
    (deleteProductIds || []).map(d => d._id)
  );

  const deleteCategoryIds = await models.ProductCategories.find(
    { $or: [{ tokens: { $exists: false } }, { tokens: [] }] },
    { _id: 1 }
  ).lean();

  for (const catId of (deleteCategoryIds || []).map(d => d._id) || []) {
    try {
      await models.ProductCategories.removeProductCategory(catId);
    } catch (_e) {
      await models.ProductCategories.updateOne(
        { _id: catId },
        { $set: { status: PRODUCT_CATEGORY_STATUSES.DISABLED } }
      );
    }
  }
};

export const importProducts = async (
  subdomain,
  models: IModels,
  token: string,
  groups: any = []
) => {
  const FILE_PATH = `${await getServerAddress(subdomain, 'core')}/read-file`;

  const attachmentUrlChanger = attachment => {
    return attachment && attachment.url && !attachment.url.includes('http')
      ? { ...attachment, url: `${FILE_PATH}?key=${attachment.url}` }
      : attachment;
  };

  for (const group of groups) {
    const categories = group.categories || [];

    for (const category of categories) {
      if (category._id) {
        await models.ProductCategories.updateOne(
          { _id: category._id },
          {
            $set: { ...category, products: undefined },
            $addToSet: { tokens: token }
          },
          { upsert: true }
        );
      }

      const bulkOps: {
        updateOne: {
          filter: { _id: string };
          update: any;
          upsert: true;
        };
      }[] = [];

      for (const product of category.products) {
        bulkOps.push({
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                ...product,
                sku: product.sku || 'ш',
                attachment: attachmentUrlChanger(product.attachment),
                attachmentMore: (product.attachmentMore || []).map(a =>
                  attachmentUrlChanger(a)
                )
              },
              $addToSet: { tokens: token }
            },
            upsert: true
          }
        });
      }

      if (bulkOps.length) {
        await models.Products.bulkWrite(bulkOps);
      }
    }
  } // end group loop
};

// Pos config created in main erxes differs from here
export const extractConfig = async (subdomain, doc) => {
  const {
    uiOptions = {
      favIcon: '',
      logo: '',
      bgImage: '',
      receiptIcon: '',
      kioskHeaderImage: '',
      mobileAppImage: '',
      qrCodeImage: ''
    }
  } = doc;

  const FILE_PATH = `${await getServerAddress(subdomain, 'core')}/read-file`;

  try {
    uiOptions.favIcon =
      (uiOptions.favIcon || '').indexOf('http') === -1
        ? `${FILE_PATH}?key=${uiOptions.favIcon}`
        : uiOptions.favIcon;

    uiOptions.logo =
      (uiOptions.logo || '').indexOf('http') === -1
        ? `${FILE_PATH}?key=${uiOptions.logo}`
        : uiOptions.logo;

    uiOptions.bgImage =
      (uiOptions.bgImage || '').indexOf('http') === -1
        ? `${FILE_PATH}?key=${uiOptions.bgImage}`
        : uiOptions.bgImage;

    uiOptions.receiptIcon =
      (uiOptions.receiptIcon || '').indexOf('http') === -1
        ? `${FILE_PATH}?key=${uiOptions.receiptIcon}`
        : uiOptions.receiptIcon;

    uiOptions.kioskHeaderImage =
      (uiOptions.kioskHeaderImage || '').indexOf('http') === -1
        ? `${FILE_PATH}?key=${uiOptions.kioskHeaderImage}`
        : uiOptions.kioskHeaderImage;

    uiOptions.mobileAppImage =
      (uiOptions.mobileAppImage || '').indexOf('http') === -1
        ? `${FILE_PATH}?key=${uiOptions.mobileAppImage}`
        : uiOptions.mobileAppImage;

    uiOptions.qrCodeImage =
      (uiOptions.qrCodeImage || '').indexOf('http') === -1
        ? `${FILE_PATH}?key=${uiOptions.qrCodeImage}`
        : uiOptions.qrCodeImage;
  } catch (e) {
    console.log(e, '-------');
  }

  return {
    name: doc.name,
    description: doc.description,
    productDetails: doc.productDetails,
    adminIds: doc.adminIds,
    cashierIds: doc.cashierIds,
    beginNumber: doc.beginNumber,
    maxSkipNumber: doc.maxSkipNumber,
    uiOptions,
    ebarimtConfig: doc.ebarimtConfig,
    kitchenScreen: doc.kitchenScreen,
    waitingScreen: doc.waitingScreen,
    catProdMappings: doc.catProdMappings,
    posSlot: doc.posSlot,
    initialCategoryIds: doc.initialCategoryIds,
    kioskExcludeProductIds: doc.kioskExcludeProductIds,
    deliveryConfig: doc.deliveryConfig,
    posId: doc._id,
    branchId: doc.branchId
  };
};

export const validateConfig = (config: IConfig) => {
  const { adminIds = [], cashierIds = [], name } = config;

  if (!name) {
    throw new Error('POS name missing');
  }

  if (adminIds.length + cashierIds.length === 0) {
    throw new Error('Admin & cashier user list empty');
  }
};

// receive product data through message broker
export const receiveProduct = async (models: IModels, data) => {
  const { token, action = '', object = {}, updatedDocument } = data;

  await models.Configs.getConfig({ token });

  const product = await models.Products.findOne({ _id: object._id });
  let tokens: string[] = [];

  if (product) {
    tokens = product.tokens;
  }

  if (action === 'create' || action === 'update') {
    if (!tokens.includes(token)) {
      tokens.push(token);
    }
    const info = action === 'update' ? updatedDocument : object;
    return await models.Products.updateOne(
      { _id: object._id },
      { ...info, tokens },
      { upsert: true }
    );
  }

  if (action === 'delete') {
    if (!product || product.status === PRODUCT_STATUSES.DELETED) {
      return;
    }
    // check usage
    return models.Products.removeProducts([object._id]);
  }
};

export const receiveProductCategory = async (models: IModels, data) => {
  const { token, action = '', object = {}, updatedDocument = {} } = data;

  await models.Configs.getConfig({ token });

  const category = await models.ProductCategories.findOne({ _id: object._id });
  let tokens: string[] = [];

  if (category) {
    tokens = category.tokens;
  }

  if (action === 'create' || action === 'update') {
    if (!tokens.includes(token)) {
      tokens.push(token);
    }
    const info = action === 'update' ? updatedDocument : object;
    return await models.ProductCategories.updateOne(
      { _id: object._id },
      { ...info, tokens },
      { upsert: true }
    );
  }

  if (action === 'delete') {
    if (!category || category.status !== PRODUCT_CATEGORY_STATUSES.ACTIVE) {
      return;
    }

    await models.ProductCategories.removeProductCategory(category._id);
  }
};

export const receiveUser = async (models: IModels, data) => {
  const { action = '', object = {}, updatedDocument = {}, token } = data;
  const userId =
    updatedDocument && updatedDocument._id ? updatedDocument._id : '';

  // user create logic will be implemented in pos config changes
  const user = await models.PosUsers.findOne({ _id: userId });

  if (action === 'update' && user) {
    const tokens = user.tokens;

    if (!tokens.includes(token)) {
      tokens.push(token);
    }

    return models.PosUsers.updateOne(
      { _id: userId },
      {
        $set: {
          username: updatedDocument.username,
          password: updatedDocument.password,
          isOwner: updatedDocument.isOwner,
          email: updatedDocument.email,
          isActive: updatedDocument.isActive,
          details: updatedDocument.details,
          tokens
        }
      }
    );
  }

  if (action === 'delete' && object._id) {
    return models.PosUsers.updateOne(
      { _id: object._id },
      { $set: { isActive: false } }
    );
  }
};

export const receivePosConfig = async (
  subdomain: string,
  models: IModels,
  data
) => {
  const { token, pos = {}, adminUsers = [], cashiers = [] } = data;

  let config: IConfigDocument | null = await models.Configs.findOne({
    token
  }).lean();

  const adminIds = pos.adminIds || [];
  const cashierIds = pos.cashierIds || [];

  if (!config) {
    const { SKIP_REDIS } = process.env;

    if (SKIP_REDIS) {
      throw new Error('token not found');
    }

    config = await models.Configs.createConfig(token);
  }

  await models.Configs.updateConfig(config._id, {
    ...config,
    ...(await extractConfig(subdomain, pos)),
    token
  });

  // set not found users inactive
  await models.PosUsers.updateMany(
    { _id: { $nin: [...adminIds, ...cashierIds] }, tokens: { $in: [token] } },
    { $pull: { tokens: { $in: [token] } } }
  );

  await importUsers(models, adminUsers, token, true);
  await importUsers(models, cashiers, token, false);
};
