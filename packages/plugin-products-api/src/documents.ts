import { generateModels } from './connectionResolver';
import {
  sendCommonMessage,
  sendContactsMessage,
  sendFormsMessage
} from './messageBroker';
import { serviceDiscovery } from './configs';

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
      ...(await getCustomFields({ subdomain }))
    ];
  },

  replaceContent: async ({
    subdomain,
    data: { branchId, departmentId, productIds, content }
  }) => {
    const models = await generateModels(subdomain);

    const results: string[] = [];
    const productsIds = JSON.parse(productIds || '[]');
    const products =
      (await models.Products.find({ _id: { $in: productsIds } }).lean()) || [];

    const pricingAvailable = await serviceDiscovery.isEnabled('pricing');
    let quantityRules = {};

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
          let unitPrice = (product.unitPrice -= discount.value);
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
