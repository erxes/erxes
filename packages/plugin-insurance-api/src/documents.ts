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

const getDeal = async (subdomain, dealId) => {
  const deal = await sendCommonMessage({
    serviceName: 'cards',
    subdomain,
    action: 'deals.findOne',
    isRPC: true,
    defaultValue: null,
    data: { _id: dealId },
  });

  return deal;
};

const getCustomers = async (subdomain, dealId) => {
  const conformities = await sendCommonMessage({
    serviceName: 'core',
    subdomain,
    action: 'conformities.getConformities',
    data: {
      mainType: 'deal',
      mainTypeIds: [dealId],
      relTypes: ['customer'],
    },
    isRPC: true,
    defaultValue: [],
  });

  const customerIds = conformities.map((c) => c.relTypeId);

  const customers = await sendCommonMessage({
    serviceName: 'customers',
    subdomain,
    action: 'customers.find',
    data: { _id: { $in: customerIds } },
    isRPC: true,
    defaultValue: [],
  });

  return customers;
};

const getCompanies = async (subdomain, dealId) => {
  const conformities = await sendCommonMessage({
    serviceName: 'core',
    subdomain,
    action: 'conformities.getConformities',
    data: {
      mainType: 'deal',
      mainTypeIds: [dealId],
      relTypes: ['company'],
    },
    isRPC: true,
    defaultValue: [],
  });

  const companyIds = conformities.map((c) => c.relTypeId);

  const companies = await sendCommonMessage({
    serviceName: 'companies',
    subdomain,
    action: 'companies.find',
    data: { _id: { $in: companyIds } },
    isRPC: true,
    defaultValue: [],
  });

  return companies;
};

const getFields = async ({ subdomain }) => {
  const itemFields = await sendCommonMessage({
    serviceName: 'forms',
    subdomain,
    action: 'fields.fieldsCombinedByContentType',
    isRPC: true,
    data: {
      contentType: 'insurance:item',
    },
    defaultValue: [],
  });
  //   return fields.map((f) => ({ value: f.name, name: f.label }));

  const productFields = await sendCommonMessage({
    serviceName: 'forms',
    subdomain,
    action: 'fields.fieldsCombinedByContentType',
    isRPC: true,
    data: {
      contentType: 'insurance:product',
    },
    defaultValue: [],
  });

  const dealFields = await sendCommonMessage({
    serviceName: 'forms',
    subdomain,
    action: 'fields.fieldsCombinedByContentType',
    isRPC: true,
    data: {
      contentType: 'cards:deal',
    },
    defaultValue: [],
  });

  const fields = [...itemFields, ...productFields, ...dealFields].map((f) => ({
    value: f.name,
    name: f.label,
  }));

  fields.push({
    value: 'insuranceProductName',
    name: 'Insurance product Name',
  });
  fields.push({ value: 'insuranceRisks', name: 'Insurance risks' });
  fields.push({ value: 'insuranceCategoryName', name: 'Insurance category' });
  fields.push({ value: 'price', name: 'Price' });
  fields.push({ value: 'feePercent', name: 'Fee percent' });
  fields.push({ value: 'totalFee', name: 'Total fee' });

  fields.push({ value: 'dealNumber', name: 'Deal number' });
  fields.push({ value: 'dealCreatedAt', name: 'Deal created at' });
  fields.push({ value: 'dealStartDate', name: 'Deal start date' });
  fields.push({ value: 'dealCloseDate', name: 'Deal close date' });

  fields.push({ value: 'customers', name: 'Customers' });
  fields.push({ value: 'companies', name: 'Companies' });

  return fields;
};

export default {
  types: [
    {
      label: 'Insurance item',
      type: 'insurance',
    },
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
      risks = [],
    } = response;

    let replacedContent: any = content || {};

    ['price', 'feePercent', 'totalFee'].forEach((field) => {
      replacedContent = replacedContent.replace(
        new RegExp(`{{ ${field} }}`, 'g'),
        item[field] || '',
      );
    });

    if (replacedContent.includes(`{{ insuranceProductName }}`)) {
      if (product) {
        replacedContent = replacedContent.replace(
          /{{ insuranceProductName }}/g,
          product.name || 'product name undefined',
        );
      }
    }

    if (replacedContent.includes(`{{ insuranceCategoryName }}`)) {
      if (category) {
        replacedContent = replacedContent.replace(
          /{{ insuranceCategoryName }}/g,
          category.name || 'category name undefined',
        );
      }
    }

    if (replacedContent.includes(`{{ insuranceRisks }}`)) {
      if (risks) {
        replacedContent = replacedContent.replace(
          /{{ insuranceRisks }}/g,
          risks.map((r) => r.name).join(', '),
        );
      }
    }
    if (replacedContent.includes('{{ customers }}')) {
      const customers = await getCustomers(subdomain, item.dealId);

      const customerRows: string[] = [];

      for (const item of customers) {
        const name = await sendCommonMessage({
          serviceName: 'contacts',
          subdomain,
          action: 'customers.getCustomerName',
          data: { customer: item },
          isRPC: true,
          defaultValue: '',
        });

        customerRows.push(name);
      }

      replacedContent = replacedContent.replace(
        /{{ customers }}/g,
        customerRows.join(','),
      );
    }

    if (replacedContent.includes('{{ companies }}')) {
      const companies = await getCompanies(subdomain, item.dealId);

      const companyRows: string[] = [];

      for (const item of companies) {
        const name = await sendCommonMessage({
          serviceName: 'contacts',
          subdomain,
          action: 'companies.getCompanyName',
          data: { company: item },
          isRPC: true,
          defaultValue: '',
        });

        companyRows.push(name);
      }

      replacedContent = replacedContent.replace(
        /{{ companies }}/g,
        companyRows.join(','),
      );
    }

    const deal = await getDeal(subdomain, item.dealId);

    if (replacedContent.includes('{{ dealNumber }}')) {
      replacedContent = replacedContent.replace(
        /{{ dealNumber }}/g,
        deal.number || '',
      );
    }

    if (replacedContent.includes('{{ dealCreatedAt }}')) {
      replacedContent = replacedContent.replace(
        /{{ dealCreatedAt }}/g,
        deal.createdAt || '',
      );
    }

    if (replacedContent.includes('{{ dealStartDate }}')) {
      replacedContent = replacedContent.replace(
        /{{ dealStartDate }}/g,
        deal.startDate || '',
      );
    }

    if (replacedContent.includes('{{ dealCloseDate }}')) {
      replacedContent = replacedContent.replace(
        /{{ dealCloseDate }}/g,
        deal.closeDate || '',
      );
    }

    if (item.customFieldsData) {
      for (const customFieldData of item.customFieldsData) {
        replacedContent = replacedContent.replace(
          new RegExp(`{{ customFieldsData.${customFieldData.field} }}`, 'g'),
          customFieldData.value,
        );
      }
    }

    if (product.customFieldsData) {
      for (const customFieldData of product.customFieldsData) {
        replacedContent = replacedContent.replace(
          new RegExp(`{{ customFieldsData.${customFieldData.field} }}`, 'g'),
          customFieldData.value,
        );
      }
    }

    if (deal.customFieldsData) {
      for (const customFieldData of deal.customFieldsData) {
        replacedContent = replacedContent.replace(
          new RegExp(`{{ customFieldsData.${customFieldData.field} }}`, 'g'),
          customFieldData.stringValue,
        );
      }
    }

    const fields = (await getFields({ subdomain })).filter(
      (customField) => !customField.value.includes('customFieldsData'),
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
        propertyValue || '',
      );
    }

    if (replacedContent.includes('{{')) {
      replacedContent = replacedContent.replace(/{{[^}]+}}/g, '');
    }

    return [replacedContent];
  },
};
