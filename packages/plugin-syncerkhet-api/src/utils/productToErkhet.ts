import { sendProductsMessage } from '../messageBroker';
import { getConfig, toErkhet } from './utils';

export const productCategoryToErkhet = async (subdomain, params, action) => {
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

  toErkhet(config, sendData, 'product-change');
};

export const productToErkhet = async (subdomain, params, action) => {
  const product = params.updatedDocument || params.object;
  const oldProduct = params.object;

  const productCategory = await sendProductsMessage({
    subdomain,
    action: 'categories.findOne',
    data: { _id: product.categoryId },
    isRPC: true
  });

  let measureUnit = product.sku || 'ш';
  let subMeasureUnit;
  let ratioMeasureUnit;

  if (product.uomId) {
    const firstSubUom = product.subUoms.length && product.subUoms[0];

    const uoms: any[] = await sendProductsMessage({
      subdomain,
      action: 'uoms.find',
      data: { _id: { $in: [product.uomId, firstSubUom && firstSubUom.uomId] } },
      isRPC: true,
      defaultValue: []
    });

    if (uoms.length) {
      const uom = uoms.find(uom => uom._id === product.uomId);
      if (uom) {
        measureUnit = uom.code || measureUnit;
      }

      const subUom = uoms.find(
        uom => uom._id === (firstSubUom ? firstSubUom.uomId : '')
      );
      if (subUom) {
        subMeasureUnit = subUom.code;
        ratioMeasureUnit = (firstSubUom && firstSubUom.ratio) || 1;
      }
    }
  }

  const config = await getConfig(subdomain, 'ERKHET', {});

  const sendData = {
    action,
    oldCode: oldProduct.code || product.code || '',
    object: {
      code: product.code || '',
      name: product.name || '',
      measureUnit,
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

  toErkhet(config, sendData, 'product-change');
};
