import { IModels } from '../connectionResolver';
import { sendProductsMessage } from '../messageBroker';
import { getSyncLogDoc, toErkhet } from './utils';

const productCategorySender = async (
  models,
  syncLogDoc,
  config,
  action,
  oldCategory,
  category,
  parentProductCategory
) => {
  if (!(config.apiKey && config.apiSecret && config.apiToken)) {
    return;
  }

  const syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

  try {
    const sendData = {
      action,
      oldCode: oldCategory.code || category.code || '',
      object: {
        code: category.code || '',
        name: category.name || '',
        parentCode: parentProductCategory ? parentProductCategory.code : ''
      }
    };

    toErkhet(models, syncLog, config, sendData, 'product-change');
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } }
    );
  }
};

export const productCategoryToErkhet = async (
  subdomain,
  models: IModels,
  params,
  action
) => {
  const syncLogDoc = getSyncLogDoc(params);
  const category = params.updatedDocument || params.object;
  const oldCategory = params.object;

  const configs = await models.Configs.getConfig('erkhetConfig', {});
  const configBrandIds = Object.keys(configs);
  if (!configBrandIds.length) {
    return;
  }

  const parentProductCategory = await sendProductsMessage({
    subdomain,
    action: 'categories.findOne',
    data: { _id: category.parentId },
    isRPC: true
  });
  const noBrandConfig = configs['noBrand'];

  const remBrands = oldCategory.scopeBrandIds.filter(
    b => !category.scopeBrandIds.includes(b)
  );
  const updBrands = category.scopeBrandIds;

  for (const remBrand of remBrands) {
    const config = configs[remBrand];
    productCategorySender(
      models,
      syncLogDoc,
      config,
      'delete',
      oldCategory,
      category,
      parentProductCategory
    );
  }

  for (const updBrand of updBrands) {
    const config = configs[updBrand];
    productCategorySender(
      models,
      syncLogDoc,
      config,
      action,
      oldCategory,
      category,
      parentProductCategory
    );
  }

  if (noBrandConfig && !updBrands.length) {
    productCategorySender(
      models,
      syncLogDoc,
      noBrandConfig,
      action,
      oldCategory,
      category,
      parentProductCategory
    );
  }
};

const productSender = async (
  models,
  syncLogDoc,
  config,
  action,
  oldProduct,
  product,
  productCategory,
  subMeasureUnit,
  ratioMeasureUnit
) => {
  if (!(config.apiKey && config.apiSecret && config.apiToken)) {
    return;
  }

  const syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

  try {
    const sendData = {
      action,
      oldCode: oldProduct.code || product.code || '',
      object: {
        code: product.code || 'ш',
        name: product.name || '',
        measureUnit: product.uom,
        subMeasureUnit,
        ratioMeasureUnit,
        barcodes: product.barcodes.join(','),
        unitPrice: product.unitPrice || 0,
        costAccount: config.costAccount,
        saleAccount: config.saleAccount,
        categoryCode: productCategory ? productCategory.code : '',
        defaultCategory: config.productCategoryCode,
        taxType: product.taxType,
        taxCode: product.taxCode
      }
    };

    toErkhet(models, syncLog, config, sendData, 'product-change');
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } }
    );
  }
};

export const productToErkhet = async (subdomain, models, params, action) => {
  const syncLogDoc = getSyncLogDoc(params);
  const product = params.updatedDocument || params.object;
  const oldProduct = params.object;

  const configs = await models.Configs.getConfig('erkhetConfig', {});
  const configBrandIds = Object.keys(configs);
  if (!configBrandIds.length) {
    return;
  }

  const productCategory = await sendProductsMessage({
    subdomain,
    action: 'categories.findOne',
    data: { _id: product.categoryId },
    isRPC: true
  });

  let subMeasureUnit;
  let ratioMeasureUnit;

  if (product.subUoms && product.subUoms.length) {
    const subUom = product.subUoms[0];
    subMeasureUnit = subUom.uom;
    ratioMeasureUnit = subUom.ratio;
  }

  const noBrandConfig = configs['noBrand'];

  const remBrands = oldProduct.scopeBrandIds.filter(
    b => !product.scopeBrandIds.includes(b)
  );
  const updBrands = product.scopeBrandIds;

  for (const remBrand of remBrands) {
    const config = configs[remBrand];
    productSender(
      models,
      syncLogDoc,
      config,
      'delete',
      oldProduct,
      product,
      productCategory,
      subMeasureUnit,
      ratioMeasureUnit
    );
  }

  for (const updBrand of updBrands) {
    const config = configs[updBrand];
    productSender(
      models,
      syncLogDoc,
      config,
      action,
      oldProduct,
      product,
      productCategory,
      subMeasureUnit,
      ratioMeasureUnit
    );
  }

  if (noBrandConfig && !updBrands.length) {
    productSender(
      models,
      syncLogDoc,
      noBrandConfig,
      action,
      oldProduct,
      product,
      productCategory,
      subMeasureUnit,
      ratioMeasureUnit
    );
  }
};
