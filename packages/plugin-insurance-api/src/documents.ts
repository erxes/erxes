import { generateModels } from './connectionResolver';
import { sendCommonMessage } from './messageBroker';

const getItem = async (subdomain, _id) => {
  const models = await generateModels(subdomain);

  const item = await models.Items.findById(_id).lean();

  const product = await models.Products.findById(item.productId).lean();

  const category = await models.Categories.findById(product.categoryId).lean();

  const risks = await models.Risks.find({ productId: product._id }).lean();

  return { item, product, category, risks };
};

const getFields = async ({ subdomain }) => {
  const itemFields = await sendCommonMessage({
    serviceName: 'forms',
    subdomain,
    action: 'fields.fieldsCombinedByContentType',
    isRPC: true,
    data: {
      contentType: 'insurance:item'
    },
    defaultValue: []
  });
  //   return fields.map((f) => ({ value: f.name, name: f.label }));

  const productFields = await sendCommonMessage({
    serviceName: 'forms',
    subdomain,
    action: 'fields.fieldsCombinedByContentType',
    isRPC: true,
    data: {
      contentType: 'insurance:product'
    },
    defaultValue: []
  });

  const fields = [...itemFields, ...productFields].map(f => ({
    value: f.name,
    name: f.label
  }));

  fields.push({
    value: 'insuranceProductName',
    name: 'Insurance product Name'
  });
  fields.push({ value: 'insuranceRisks', name: 'Insurance risks' });
  fields.push({ value: 'insuranceCategoryName', name: 'Insurance category' });

  return fields;
};

export default {
  types: [
    {
      label: 'Inruance item',
      type: 'insurance'
    }
  ],

  editorAttributes: async ({ subdomain, data: { contentType } }) => {
    return await getFields({ subdomain });
  },
  replaceContent: async ({ subdomain, data: { itemId, content } }) => {
    const response = await getItem(subdomain, itemId);

    if (!response) {
      return '';
    }

    const {
      item,
      product = undefined,
      category = undefined,
      risks = []
    } = response;

    let replacedContent: any = content || {};

    ['price', 'feePercent', 'totalFee'].forEach(field => {
      replacedContent = replacedContent.replace(
        new RegExp(`{{ ${field} }}`, 'g'),
        item[field] || ''
      );
    });

    if (replacedContent.includes(`{{ insuranceProductName }}`)) {
      if (product) {
        replacedContent = replacedContent.replace(
          /{{ insuranceProductName }}/g,
          product.name || 'product name undefined'
        );
      }
    }

    if (replacedContent.includes(`{{ insuranceCategoryName }}`)) {
      if (category) {
        replacedContent = replacedContent.replace(
          /{{ insuranceCategoryName }}/g,
          category.name || 'category name undefined'
        );
      }
    }

    if (replacedContent.includes(`{{ insuranceRisks }}`)) {
      if (risks) {
        replacedContent = replacedContent.replace(
          /{{ insuranceRisks }}/g,
          risks.map(r => r.name).join(', ')
        );
      }
    }

    for (const customFieldData of item.customFieldsData) {
      replacedContent = replacedContent.replace(
        new RegExp(`{{ customFieldsData.${customFieldData.field} }}`, 'g'),
        customFieldData.stringValue
      );
    }

    for (const customFieldData of product.customFieldsData) {
      replacedContent = replacedContent.replace(
        new RegExp(`{{ customFieldsData.${customFieldData.field} }}`, 'g'),
        customFieldData.stringValue
      );
    }

    const fields = (await getFields({ subdomain })).filter(
      customField => !customField.value.includes('customFieldsData')
    );

    for (const field of fields) {
      const propertyNames = field.value.includes('.')
        ? field.value.split('.')
        : [field.value];
      let propertyValue = item;

      for (const propertyName in propertyNames) {
        propertyValue = propertyValue[propertyName] || propertyValue;
      }

      replacedContent = replacedContent.replace(
        new RegExp(` {{ ${field.value} }} `, 'g'),
        propertyValue || ''
      );
    }

    return [replacedContent];
  }
};
