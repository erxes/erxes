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

    for (const productId of JSON.parse(productIds || '[]')) {
      const product = await models.Products.findOne({ _id: productId });

      if (!product) {
        continue;
      }

      let replacedContent = content;

      replacedContent = replacedContent.replace('{{ name }}', product.name);
      replacedContent = replacedContent.replace('{{ code }}', product.code);

      const pricingAvailable = await serviceDiscovery.isEnabled('pricing');

      let mainPrice = product.unitPrice || 0;

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
            products: [
              {
                productId: product._id,
                quantity: 1,
                price: product.unitPrice
              }
            ]
          },
          isRPC: true,
          defaultValue: {}
        });

        const discount = pricing[product._id] || {};

        if (Object.keys(discount).length) {
          let unitPrice = (mainPrice -= discount.value);
          if (unitPrice < 0) {
            unitPrice = 0;
          }

          mainPrice = unitPrice;
        }

        const { value, price } = await sendCommonMessage({
          subdomain,
          serviceName: 'pricing',
          action: 'getQuanityRules',
          isRPC: true,
          defaultValue: [],
          data: {
            product: { ...product, unitPrice: mainPrice }
          }
        });

        replacedContent = replacedContent.replace(
          '{{ bulkQuantity }}',
          value || ''
        );
        replacedContent = replacedContent.replace(
          '{{ bulkPrice }}',
          toMoney(price)
        );
      }

      replacedContent = replacedContent.replace(
        '{{ price }}',
        toMoney(product.unitPrice)
      );

      results.push(replacedContent);
    }

    return results;
  }
};
