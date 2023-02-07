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

  replaceContent: async ({ subdomain, data: { productIds, content } }) => {
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
      replacedContent = replacedContent.replace(
        '{{ price }}',
        toMoney(product.unitPrice)
      );

      const pricingAvailable = await serviceDiscovery.isEnabled('pricing');

      if (pricingAvailable) {
        const { value, price } = await sendCommonMessage({
          subdomain,
          serviceName: 'pricing',
          action: 'getQuanityRules',
          isRPC: true,
          defaultValue: [],
          data: {
            product
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

      results.push(replacedContent);
    }

    return results;
  }
};
