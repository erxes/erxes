import { dateToShortStr } from '@erxes/api-utils/src/core';
import * as moment from 'moment';
import { serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';
import {
  sendCommonMessage,
  sendContactsMessage,
  sendFormsMessage
} from './messageBroker';
import { IProductDocument } from './models/definitions/products';

const toMoney = value => {
  if (!value) {
    return '-';
  }
  return new Intl.NumberFormat().format(value);
};

const getCustomFields = async ({ subdomain }) => {
  const fields = await sendFormsMessage({
    subdomain,
    action: 'fields.fieldsCombinedByContentType',
    isRPC: true,
    data: {
      contentType: `products:product`
    },
    defaultValue: []
  });

  return fields
    .filter(field => !['categoryId', 'code'].includes(field.name))
    .map(field => ({ value: field.name, name: field.label, type: field.type }));
};

export default {
  types: [
    {
      type: 'products',
      label: 'Products'
    }
  ],

  editorAttributes: async ({ subdomain }) => {
    return [
      { value: 'name', name: 'Name' },
      { value: 'code', name: 'Code' },
      { value: 'price', name: 'Price' },
      { value: 'bulkQuantity', name: 'Bulk quantity' },
      { value: 'bulkPrice', name: 'Bulk price' },
      { value: 'barcode', name: 'Barcode' },
      { value: 'date', name: 'Date' },
      { value: 'barcodeDescription', name: 'Barcode description' },

      ...(await getCustomFields({ subdomain }))
    ];
  },

  replaceContent: async ({
    subdomain,
    data: { branchId, departmentId, productIds, date, isDate, content }
  }) => {
    const models = await generateModels(subdomain);

    const results: string[] = [];
    const productsIds = JSON.parse(productIds || '[]');
    const products: IProductDocument[] =
      (await models.Products.find({ _id: { $in: productsIds } }).lean()) || [];

    const pricingAvailable = await serviceDiscovery.isEnabled('pricing');
    let quantityRules = {};

    if (content.includes('{{ barcode }}')) {
      results.push(
        '::heads::<script src="https://nmgplugins.s3.us-west-2.amazonaws.com/JsBarcode.all.min.js"></script><script src="https://nmgplugins.s3.us-west-2.amazonaws.com/ebarimt/jquery.js"></script>'
      );
    }

    if (pricingAvailable) {
      const pricing = await sendCommonMessage({
        subdomain,
        serviceName: 'pricing',
        action: 'checkPricing',
        data: {
          prioritizeRule: 'only',
          totalAmount: 0,
          departmentId,
          branchId,
          products: products.map(pr => ({
            itemId: pr._id,
            productId: pr._id,
            quantity: 1,
            price: pr.unitPrice
          }))
        },
        isRPC: true,
        defaultValue: {}
      });

      for (const product of products) {
        const discount = pricing[product._id] || {};

        if (Object.keys(discount).length) {
          let unitPrice = (product.unitPrice =
            (product.unitPrice || 0) - discount.value);
          if (unitPrice < 0) {
            unitPrice = 0;
          }
        }
      }

      quantityRules = await sendCommonMessage({
        subdomain,
        serviceName: 'pricing',
        action: 'getQuanityRules',
        isRPC: true,
        defaultValue: [],
        data: {
          prioritizeRule: 'exclude',
          branchId,
          departmentId,
          products
        }
      });
    }

    for (const product of products) {
      const qtyRule = quantityRules[product._id] || {};
      const { value, price } = qtyRule;

      let replacedContent = content;

      replacedContent = replacedContent.replace('{{ name }}', product.name);
      replacedContent = replacedContent.replace('{{ code }}', product.code);

      replacedContent = replacedContent.replace(
        '{{ price }}',
        toMoney(product.unitPrice)
      );

      replacedContent = replacedContent.replace(
        '{{ bulkQuantity }}',
        value || '-'
      );
      replacedContent = replacedContent.replace(
        '{{ bulkPrice }}',
        toMoney(price)
      );

      if (content.includes('{{ barcode }}')) {
        let barcode = (product.barcodes || [])[0] || '';
        let shortStr = '';
        if (barcode) {
          if (['1', 'true', 'True'].includes(isDate)) {
            shortStr = `_${dateToShortStr(date, 92, 'h')}`;
          }

          replacedContent = replacedContent.replace(
            '{{ barcode }}',
            `
              <p style="text-align: center;">
              <svg id="barcode${barcode}"></svg>
              </p>
              <script>
                JsBarcode("#barcode${barcode}", "${barcode}${shortStr}", {
                  width: 1.5,
                  height: 40,
                  displayValue: true
                });
              </script>
            `
          );
        }
      }

      replacedContent = replacedContent.replace(
        '{{ date }}',
        moment(value).format('YYYY-MM-DD HH:mm')
      );

      replacedContent = replacedContent.replace(
        '{{ barcodeDescription }}',
        product.barcodeDescription || ''
      );

      if (replacedContent.includes(`{{ vendorId }}`)) {
        const vendor = await sendContactsMessage({
          subdomain,
          action: 'companies.findOne',
          data: {
            _id: product.vendorId
          },
          isRPC: true,
          defaultValue: {}
        });

        if (vendor?.primaryName) {
          replacedContent = replacedContent.replace(
            /{{ vendorId }}/g,
            vendor.primaryName
          );
        }
      }

      for (const customFieldData of product.customFieldsData || []) {
        replacedContent = replacedContent.replace(
          new RegExp(`{{ customFieldsData.${customFieldData.field} }}`, 'g'),
          customFieldData.value
        );
      }

      results.push(replacedContent);
    }

    return results;
  }
};
