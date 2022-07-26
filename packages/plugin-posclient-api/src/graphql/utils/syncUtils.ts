import { IModels } from '../../connectionResolver';
import { IPosUserDocument } from '../../models/definitions/posUsers';
import { IConfig } from '../../models/definitions/configs';

export const importUsers = async (
  models: IModels,
  users: IPosUserDocument[],
  isAdmin: boolean = false
) => {
  for (const user of users) {
    await models.PosUsers.createOrUpdateUser({
      _id: user._id,
      username: user.username,
      email: user.email,
      password: user.password,
      isOwner: user.isOwner || isAdmin,
      isActive: user.isActive,
      details: user.details
    });
  }
};

export const preImportProducts = async (models: IModels, groups: any = []) => {
  let importProductIds: string[] = [];
  const importProductCatIds: string[] = [];
  const oldAllProducts = await models.Products.find({}, { _id: 1 }).lean();
  const oldProductIds = oldAllProducts.map(p => p._id);
  const oldAllProductCats = await models.ProductCategories.find(
    {},
    { _id: 1 }
  ).lean();
  const oldCategoryIds = oldAllProductCats.map(p => p._id);

  for (const group of groups) {
    const categories = group.categories || [];

    for (const category of categories) {
      importProductCatIds.push(category._id);
      importProductIds = importProductIds.concat(
        category.products.map(p => p._id)
      );
    }
  } // end group loop

  const removeProductIds = oldProductIds.filter(
    id => !importProductIds.includes(id)
  );
  await models.Products.removeProducts(removeProductIds);

  const removeCategoryIds = oldCategoryIds.filter(
    id => !importProductCatIds.includes(id)
  );
  for (const catId of removeCategoryIds) {
    await models.ProductCategories.removeProductCategory(catId);
  }
};

export const importProducts = async (models: IModels, groups: any = []) => {
  const { NEXT_PUBLIC_REACT_APP_MAIN_API_DOMAIN } = process.env;
  const FILE_PATH = `${NEXT_PUBLIC_REACT_APP_MAIN_API_DOMAIN}/read-file`;
  const attachmentUrlChanger = attachment => {
    return attachment && attachment.url && !attachment.url.includes('http')
      ? { ...attachment, url: `${FILE_PATH}?key=${attachment.url}` }
      : attachment;
  };

  for (const group of groups) {
    const categories = group.categories || [];

    for (const category of categories) {
      await models.ProductCategories.updateOne(
        { _id: category._id },
        { $set: { ...category, products: undefined } },
        { upsert: true }
      );

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
              }
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

export const preImportCustomers = async customers => {
  const importCustomerIds = customers.map(c => c._id);
};

export const importCustomers = async customers => {
  let bulkOps: {
    updateOne: {
      filter: { _id: string };
      update: any;
      upsert: true;
    };
  }[] = [];

  let counter = 0;
  for (const customer of customers) {
    if (counter > 1000) {
      counter = 0;
      bulkOps = [];
    }

    counter += 1;

    bulkOps.push({
      updateOne: {
        filter: { _id: customer._id },
        update: { $set: { ...customer } },
        upsert: true
      }
    });
  }

  if (bulkOps.length) {
  }
};

// Pos config created in main erxes differs from here
export const extractConfig = doc => {
  const { NEXT_PUBLIC_REACT_APP_MAIN_API_DOMAIN } = process.env;
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
  console.log(uiOptions);

  const FILE_PATH = `${NEXT_PUBLIC_REACT_APP_MAIN_API_DOMAIN}/read-file`;

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
    posId: doc._id
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
export const receiveProduct = async (models, data) => {
  const { action = '', object = {}, updatedDocument = {} } = data;

  if (action === 'create') {
    return models.Products.createProduct(object);
  }

  const product = await models.Products.findOne({ _id: object._id });

  if (action === 'update' && product) {
    return models.Products.updateProduct(product._id, updatedDocument);
  }

  if (action === 'delete') {
    // check usage
    return models.Products.removeProducts([object._id]);
  }
};

export const receiveProductCategory = async (models, data) => {
  const { action = '', object = {}, updatedDocument = {} } = data;

  if (action === 'create') {
    return models.ProductCategories.createProductCategory(object);
  }

  const category: any = await models.ProductCategories.findOne({
    _id: object._id
  });

  if (action === 'update' && category) {
    return models.ProductCategories.updateProductCategory(
      category._id,
      updatedDocument
    );
  }

  if (action === 'delete') {
    await models.ProductCategories.removeProductCategory(category._id);
  }
};

export const receiveUser = async (models: IModels, data) => {
  const { action = '', object = {}, updatedDocument = {} } = data;
  const userId =
    updatedDocument && updatedDocument._id ? updatedDocument._id : '';

  // user create logic will be implemented in pos config changes
  const user = await models.PosUsers.findOne({ _id: userId });

  if (action === 'update' && user) {
    return models.PosUsers.updateOne(
      { _id: userId },
      {
        $set: {
          username: updatedDocument.username,
          password: updatedDocument.password,
          isOwner: updatedDocument.isOwner,
          email: updatedDocument.email,
          isActive: updatedDocument.isActive,
          details: updatedDocument.details
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

export const receivePosConfig = async (models: IModels, data) => {
  const {
    updatedDocument = {},
    action = '',
    adminUsers = [],
    cashierUsers = []
  } = data;

  const config = await models.Configs.getConfig({
    token: updatedDocument.token
  });

  if (action === 'update' && config) {
    const adminIds = updatedDocument.adminIds || [];
    const cashierIds = updatedDocument.cashierIds || [];

    await models.Configs.updateConfig(config._id, {
      ...config,
      ...extractConfig(updatedDocument)
    });

    // set not found users inactive
    await models.PosUsers.updateMany(
      { _id: { $nin: [...adminIds, ...cashierIds] } },
      { $set: { isActive: false } }
    );

    await importUsers(models, adminUsers, true);
    await importUsers(models, cashierUsers, false);
  }
};
