import { generateModels } from './connectionResolver';
import {
  sendContactsMessage,
  sendCoreMessage,
  sendProductsMessage,
  sendFormsMessage
} from './messageBroker';
import * as _ from 'lodash';
const toMoney = value => {
  return new Intl.NumberFormat().format(value);
};

const getCustomFields = async ({ subdomain }) => {
  let fields: any[] = [];

  for (const cardType of ['task', 'ticket', 'deal', 'purchase']) {
    let items = await sendFormsMessage({
      subdomain,
      action: 'fields.fieldsCombinedByContentType',
      isRPC: true,
      data: {
        contentType: `cards:${cardType}`
      },
      defaultValue: []
    });

    fields = [
      ...fields,
      ...items.map(f => ({
        value: f.name,
        name: `${cardType}:${f.label}`
      }))
    ];
  }
  return fields;
};

const commonFields = [
  { value: 'name', name: 'Name' },
  { value: 'createdAt', name: 'Created at' },
  { value: 'closeDate', name: 'Close date' },
  { value: 'description', name: 'Description' },
  { value: 'productsInfo', name: 'Products information' },
  { value: 'servicesInfo', name: 'Services information' },
  { value: 'assignedUsers', name: 'Assigned users' },
  { value: 'customers', name: 'Customers' },
  { value: 'companies', name: 'Companies' },
  { value: 'now', name: 'Now' },
  { value: 'productTotalAmount', name: 'Products total amount' },
  { value: 'servicesTotalAmount', name: 'Services total amount' },
  { value: 'totalAmount', name: 'Total amount' },
  { value: 'totalAmountVat', name: 'Total amount vat' },
  { value: 'totalAmountWithoutVat', name: 'Total amount without vat' },
  { value: 'discount', name: 'Discount' },
  { value: 'paymentCash', name: 'Payment cash' },
  { value: 'paymentNonCash', name: 'Payment non cash' }
];

export default {
  types: [
    {
      label: 'Cards',
      type: 'cards'
    }
  ],

  editorAttributes: async ({ subdomain }) => {
    const customFields = await getCustomFields({ subdomain });
    const uniqueFields = customFields.filter(
      customField =>
        !commonFields.some(field => field.value === customField.value)
    );
    return [...commonFields, ...uniqueFields];
  },

  replaceContent: async ({ subdomain, data: { stageId, itemId, content } }) => {
    const models = await generateModels(subdomain);
    const stage = await models.Stages.findOne({ _id: stageId });

    if (!stage) {
      return '';
    }

    let collection;

    if (stage.type == 'deal') {
      collection = models.Deals;
    }
    if (stage.type == 'purchase') {
      collection = models.Purchases;
    }
    if (stage.type == 'ticket') {
      collection = models.Tickets;
    }

    if (stage.type == 'task') {
      collection = models.Tasks;
    }

    if (stage.type == 'growthHack') {
      collection = models.GrowthHacks;
    }

    if (!collection) {
      return '';
    }

    const item = await collection.findOne({ _id: itemId });

    if (!item) {
      return '';
    }

    const simpleFields = ['name', 'description'];

    let replacedContent = content;

    for (const field of simpleFields) {
      replacedContent = replacedContent.replace(
        `{{ ${field} }}`,
        item[field] || ''
      );
    }

    replacedContent = replacedContent.replace(
      /{{ createdAt }}/g,
      item.createdAt.toLocaleDateString()
    );

    if (item.closeDate) {
      replacedContent = replacedContent.replace(
        /{{ closeDate }}/g,
        item.closeDate.toLocaleDateString()
      );
    }

    replacedContent = replacedContent.replace(
      /{{ now }}/g,
      new Date().toLocaleDateString()
    );

    // ============ replace users
    const users = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      isRPC: true,
      data: {
        query: { _id: { $in: item.assignedUserIds || [] } }
      }
    });

    replacedContent = replacedContent.replace(
      /{{ assignedUsers }}/g,
      users
        .map(
          user =>
            `${user.details.firstName || ''} ${user.details.lastName || ''}`
        )
        .join(',')
    );

    if (replacedContent.includes('{{ customers }}')) {
      const customerIds = await sendCoreMessage({
        subdomain,
        action: 'conformities.savedConformity',
        data: {
          mainType: stage.type,
          mainTypeId: item._id,
          relTypes: ['customer']
        },
        isRPC: true,
        defaultValue: []
      });

      const activeCustomers = await sendContactsMessage({
        subdomain,
        action: 'customers.findActiveCustomers',
        data: { selector: { _id: { $in: customerIds } } },
        isRPC: true,
        defaultValue: []
      });

      const customerRows: string[] = [];

      for (const item of activeCustomers) {
        const name = await sendContactsMessage({
          subdomain,
          action: 'customers.getCustomerName',
          data: { customer: item },
          isRPC: true,
          defaultValue: ''
        });

        customerRows.push(name);
      }

      replacedContent = replacedContent.replace(
        /{{ customers }}/g,
        customerRows.join(',')
      );
    }

    if (replacedContent.includes('{{ companies }}')) {
      const companyIds = await sendCoreMessage({
        subdomain,
        action: 'conformities.savedConformity',
        data: {
          mainType: stage.type,
          mainTypeId: item._id,
          relTypes: ['company']
        },
        isRPC: true,
        defaultValue: []
      });

      const activeCompanies = await sendContactsMessage({
        subdomain,
        action: 'companies.findActiveCompanies',
        data: { selector: { _id: { $in: companyIds } } },
        isRPC: true,
        defaultValue: []
      });

      const companyRows: string[] = [];

      for (const item of activeCompanies) {
        const name = await sendContactsMessage({
          subdomain,
          action: 'companies.getCompanyName',
          data: { company: item },
          isRPC: true,
          defaultValue: ''
        });

        companyRows.push(name);
      }

      replacedContent = replacedContent.replace(
        /{{ companies }}/g,
        companyRows.join(',')
      );
    }

    const replaceProducts = async (key, type) => {
      let totalAmount = 0;
      let discount = 0;

      const productsData = item.productsData || [];

      const productRows: string[] = [];
      let index = 0;

      for (const pd of productsData) {
        if (!pd || !pd.productId) {
          continue;
        }

        const product = await sendProductsMessage({
          subdomain,
          action: 'findOne',
          data: { _id: pd.productId },
          isRPC: true
        });

        if (!product || product.type !== type) {
          continue;
        }

        index++;

        const tAmount = pd.quantity * pd.unitPrice;

        totalAmount += tAmount;
        discount += pd.discount || 0;

        productRows.push(
          `<tr>
            <td>${index}</td>
            <td>${product.name}</td>
            <td>${pd.quantity}</td>
            <td>${toMoney(pd.unitPrice)}</td>
            <td>${toMoney(tAmount)}</td>
          </tr>
          `
        );
      }

      replacedContent = replacedContent.replace(
        key,
        productRows.length > 0
          ? `<table>
              <tbody>
                <thead>
                  <tr>
                    <th>№</th>
                    <th>${
                      type === 'product' ? 'Product name' : 'Service name'
                    }</th>
                    <th>Quantity</th>
                    <th>Unit price</th>
                    <th>Total amount</th>
                  </tr>
                </thead>
                ${productRows.join('')}
              </tbody>
            </table>

            <script>
              window.print();
            </script>
            `
          : ''
      );

      return { totalAmount, discount };
    };

    const replaceProductsResult = await replaceProducts(
      /{{ productsInfo }}/g,
      'product'
    );
    const productsTotalAmount = replaceProductsResult.totalAmount;

    const replaceServicesResult = await replaceProducts(
      /{{ servicesInfo }}/g,
      'service'
    );
    const servicesTotalAmount = replaceServicesResult.totalAmount;

    const totalAmount = productsTotalAmount + servicesTotalAmount;
    const totalAmountVat = (totalAmount * 10) / 110;
    const totalAmountWithoutVat = totalAmount - totalAmountVat;

    replacedContent = replacedContent.replace(
      /{{ productTotalAmount }}/g,
      toMoney(productsTotalAmount)
    );

    replacedContent = replacedContent.replace(
      /{{ servicesTotalAmount }}/g,
      toMoney(servicesTotalAmount)
    );

    replacedContent = replacedContent.replace(
      /{{ totalAmount }}/g,
      toMoney(totalAmount)
    );

    replacedContent = replacedContent.replace(
      /{{ totalAmountVat }}/g,
      toMoney(totalAmountVat)
    );

    replacedContent = replacedContent.replace(
      /{{ totalAmountWithoutVat }}/g,
      toMoney(totalAmountWithoutVat)
    );

    const cash = ((item.paymentsData || {}).cash || {}).amount || 0;

    replacedContent = replacedContent.replace(
      /{{ paymentCash }}/g,
      toMoney(cash)
    );

    replacedContent = replacedContent.replace(
      /{{ paymentNonCash }}/g,
      toMoney(totalAmount - cash)
    );

    replacedContent = replacedContent.replace(
      /{{ discount }}/g,
      toMoney(replaceProductsResult.discount + replaceServicesResult.discount)
    );

    for (const customFieldData of item.customFieldsData || []) {
      replacedContent = replacedContent.replace(
        new RegExp(`{{ customFieldsData.${customFieldData.field} }}`, 'g'),
        customFieldData.stringValue
      );
    }

    const fileds = (await getCustomFields({ subdomain })).filter(
      customField =>
        customField.name.includes(stage.type) &&
        !customField.value.includes('customFieldsData')
    );

    for (const field of fileds) {
      const propertyNames = field.value.includes('.')
        ? field.value.split('.')
        : [field.value];
      let propertyValue = item;

      for (const propertyName of propertyNames) {
        propertyValue = item[propertyName];
      }

      replacedContent = replacedContent.replace(
        new RegExp(`{{ ${field.value} }}`, 'g'),
        propertyValue || ''
      );
    }

    return [replacedContent];
  }
};
