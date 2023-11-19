import { sendProductsMessage } from '../messageBroker';
import { getConfig, toErkhet } from './utils';

export const productCategoryToErkhet = async (
  subdomain,
  models,
  syncLog,
  params,
  action
) => {
  const productCategory = params.updatedDocument || params.object;
  const oldProductCategory = params.object;

  const parentProductCategory = await sendProductsMessage({
    subdomain,
    action: 'categories.findOne',
    data: { _id: productCategory.parentId },
    isRPC: true
  });

  const config = await getConfig(subdomain, 'ERKHET', {});

  const sendData = {
    action,
    oldCode: oldProductCategory.code || productCategory.code || '',
    object: {
      code: productCategory.code || '',
      name: productCategory.name || '',
      parentCode: parentProductCategory ? parentProductCategory.code : ''
    }
  };

  toErkhet(models, syncLog, config, sendData, 'product-change');
};

export const productToErkhet = async (
  subdomain,
  models,
  syncLog,
  params,
  action
) => {
  const product = params.updatedDocument || params.object;
  const oldProduct = params.object;

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

  const config = await getConfig(subdomain, 'ERKHET', {});

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
};
