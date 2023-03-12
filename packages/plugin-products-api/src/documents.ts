import { generateModels } from './connectionResolver';
import { sendCommonMessage } from './messageBroker';
import { serviceDiscovery } from './configs';

const toMoney = value => {
  return new Intl.NumberFormat().format(value);
};

export default {
  editorAttributes: async () => {
    return [
      { value: 'name', name: 'Name' },
      { value: 'code', name: 'Code' },
      { value: 'price', name: 'Price' },
      { value: 'bulkQuantity', name: 'Bulk quantity' },
      { value: 'bulkPrice', name: 'Bulk price' }
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

          product.unitPrice = unitPrice;
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
        value || ''
      );
      replacedContent = replacedContent.replace(
        '{{ bulkPrice }}',
        toMoney(price)
      );

      results.push(replacedContent);
    }

    return results;
  }
};
