import { sendFormsMessage, sendProductsMessage } from '../messageBroker';
import { toErkhet } from './utils';

export const productCategoryToErkhet = async (
  subdomain,
  models,
  mainConfig,
  syncLog,
  params,
  action,
) => {
  const productCategory = params.updatedDocument || params.object;
  const oldProductCategory = params.object;

  const parentProductCategory = await sendProductsMessage({
    subdomain,
    action: 'categories.findOne',
    data: { _id: productCategory.parentId },
    isRPC: true,
  });

  const sendData = {
    action,
    oldCode: oldProductCategory.code || productCategory.code || '',
    object: {
      code: productCategory.code || '',
      name: productCategory.name || '',
      parentCode: parentProductCategory ? parentProductCategory.code : '',
    },
  };

  toErkhet(models, syncLog, mainConfig, sendData, 'product-change');
};

export const productToErkhet = async (
  subdomain,
  models,
  mainConfig,
  syncLog,
  params,
  action,
) => {
  const product = params.updatedDocument || params.object;
  const oldProduct = params.object;

  const productCategory = await sendProductsMessage({
    subdomain,
    action: 'categories.findOne',
    data: { _id: product.categoryId },
    isRPC: true,
  });

  let weight = 1;

  const weightField = await sendFormsMessage({
    subdomain,
    action: 'fields.findOne',
    data: { query: { code: 'weight' } },
    isRPC: true,
    defaultValue: null,
  });

  if (weightField && weightField._id) {
    const weightData = (product.customFieldsData || []).find(
      (cfd) => cfd.field === weightField._id,
    );

    if (weightData && weightData.value) {
      weight = Number(weightData.value) || 1;
    }
  }

  let subMeasureUnit;
  let ratioMeasureUnit;

  if (product.subUoms && product.subUoms.length) {
    const subUom = product.subUoms[0];
    subMeasureUnit = subUom.uom;
    ratioMeasureUnit = subUom.ratio;
  }

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
      costAccount: mainConfig.costAccount,
      saleAccount: mainConfig.saleAccount,
      categoryCode: productCategory ? productCategory.code : '',
      defaultCategory: mainConfig.productCategoryCode,
      weight,
      taxType: product.taxType,
      taxCode: product.taxCode,
    },
  };

  toErkhet(models, syncLog, mainConfig, sendData, 'product-change');
};
