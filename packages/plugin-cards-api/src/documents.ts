import { generateModels } from './connectionResolver';
import {
  sendContactsMessage,
  sendCoreMessage,
  sendProductsMessage,
  sendFormsMessage
} from './messageBroker';

const toMoney = value => {
  return new Intl.NumberFormat().format(value);
};

// for generate placeholder regex
const generatePlaceHolderRegex = field =>
  new RegExp(`{{\\s*${field}\\s*}}`, 'g');

const findCollectionByStageType = (models, stageType) => {
  const collections = {
    deal: models.Deals,
    purchase: models.Purchases,
    ticket: models.Tickets,
    task: models.Tasks,
    growthHack: models.GrowthHacks
  };
  return collections[stageType] || null;
};

const replaceDates = (content: string, item: any) => {
  let replacedContent = content.replace(
    generatePlaceHolderRegex('createdAt'),
    item.createdAt.toLocaleDateString()
  );
  if (item.closeDate) {
    replacedContent = replacedContent.replace(
      generatePlaceHolderRegex('closeDate'),
      item.closeDate.toLocaleDateString()
    );
  }
  replacedContent = replacedContent.replace(
    generatePlaceHolderRegex('now'),
    new Date().toLocaleDateString()
  );
  return replacedContent;
};

const replaceAssignedUsers = async (
  replacedContent: string,
  item: any,
  subdomain: string
) => {
  if (
    replacedContent.includes(`{{ assignedUsers }}`) &&
    item?.assignedUserIds?.length > 0
  ) {
    const users = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      isRPC: true,
      data: { query: { _id: { $in: item.assignedUserIds || [] } } }
    });

    const userNames = users
      .map(
        user => `${user.details.firstName || ''} ${user.details.lastName || ''}`
      )
      .join(',');
    return replacedContent.replace(
      generatePlaceHolderRegex('assignedUsers'),
      userNames
    );
  }
  return replacedContent.replace(generatePlaceHolderRegex('assignedUsers'), '');
};

const replaceContacts = async (
  replacedContent: string,
  item: any,
  subdomain: string,
  field: string,
  stageType,
  relType: string,
  activeContactAction: string,
  getNameAction: string
) => {
  if (replacedContent.includes(`{{ ${field} }}`)) {
    const contactIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: {
        mainType: stageType,
        mainTypeId: item._id,
        relTypes: [relType]
      },
      isRPC: true,
      defaultValue: []
    });

    const activeContacts = await sendContactsMessage({
      subdomain,
      action: `${field}.${activeContactAction}`,
      data: { selector: { _id: { $in: contactIds } } },
      isRPC: true,
      defaultValue: []
    });

    let contactRows: string[] = [];

    for (const item of activeContacts) {
      const name = await sendContactsMessage({
        subdomain,
        action: `${field}.${getNameAction}`,
        data: { customer: item },
        isRPC: true,
        defaultValue: ''
      });

      contactRows.push(name);
    }
    replacedContent = replacedContent.replace(
      generatePlaceHolderRegex(field),
      contactRows.join(',')
    );
  }
  return replacedContent;
};

const replaceProducts = async (
  item: any,
  subdomain: string,
  replacedContent: string,
  brandId: string,
  key: any,
  type: string
) => {
  let totalAmount = 0;
  let discount = 0;

  const productsData = item.productsData || [];

  const productRows: string[] = [];
  let index = 0;

  for (const pd of productsData) {
    if (!pd || !pd.productId) {
      continue;
    }

    if (!pd.tickUsed) {
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

    if (
      (brandId &&
        brandId !== 'noBrand' &&
        !product.scopeBrandIds.includes(brandId)) ||
      (brandId === 'noBrand' && product.scopeBrandIds.length > 0)
    ) {
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
                    <th>
                      ${type === 'product' ? 'Product name' : 'Service name'}
                    </th>
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

const replaceCommonFields = (content, item, fields) => {
  return fields.reduce((updatedContent, field) => {
    return updatedContent.replace(
      generatePlaceHolderRegex(field),
      item[field] || ''
    );
  }, content);
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
  { value: 'stageName', name: 'Stage name' },
  { value: 'brandName', name: 'Brand name' },
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
      type: 'cards',
      subTypes: ['deal', 'task', 'ticket', 'purchase', 'stageDeal']
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

  replaceContent: async ({
    subdomain,
    data: { stageId, itemId, content, contentype, itemIds, brandId }
  }) => {
    const models = await generateModels(subdomain);
    const stage = await models.Stages.findOne({ _id: stageId });

    if (!stage) {
      return '';
    }
    let collection = findCollectionByStageType(models, stage.type);
    if (!collection) {
      return '';
    }
    let item;
    if (contentype == 'cards:stage') {
      const items = await collection.find({
        stageId: stageId,
        _id: { $in: itemIds.split(',') }
      });

      if (!items) {
        return '';
      }

      item = await cardsStage(items);

      if (!item) {
        return '';
      }
    } else {
      item = await collection.findOne({ _id: itemId });

      if (!item) {
        return '';
      }
    }

    const simpleFields = ['name', 'description'];

    let replacedContent =
      replaceCommonFields(content, item, simpleFields) || '';

    replacedContent = replaceDates(replacedContent, item);

    replacedContent = replacedContent.replace(
      generatePlaceHolderRegex('stageName'),
      stage.name
    );

    if (replacedContent.includes('{{ brandName }}')) {
      if (brandId) {
        const brand = await sendCoreMessage({
          subdomain,
          action: 'brands.findOne',
          data: { _id: brandId },
          isRPC: true
        });

        replacedContent = replacedContent.replace(
          generatePlaceHolderRegex('brandName'),
          brand.name
        );
      }
      replacedContent = replacedContent.replace(
        generatePlaceHolderRegex('brandName'),
        ''
      );
    }

    // ============ replace users

    replacedContent = await replaceAssignedUsers(
      replacedContent,
      item,
      subdomain
    );

    // ==== replace contacts
    replacedContent = await replaceContacts(
      replacedContent,
      item,
      subdomain,
      'customers',
      stage.type,
      'customer',
      'findActiveCustomers',
      'getCustomerName'
    );
    replacedContent = await replaceContacts(
      replacedContent,
      item,
      subdomain,
      'companies',
      stage.type,
      'company',
      'findActiveCompanies',
      'getCompanyName'
    );

    const replaceProductsResult = await replaceProducts(
      item,
      subdomain,
      replacedContent,
      brandId,
      generatePlaceHolderRegex('productsInfo'),
      'product'
    );
    const productsTotalAmount = replaceProductsResult.totalAmount;

    const replaceServicesResult = await replaceProducts(
      item,
      subdomain,
      replacedContent,
      brandId,
      generatePlaceHolderRegex('servicesInfo'),
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

const cardsStage = async (items: any[]) => {
  try {
    const itemsArray = items;
    const aggregatedData: Record<string, any> = {
      amount: {
        AED: 0
      },
      productsData: []
    };
    itemsArray.forEach(item => {
      const combinedNames = itemsArray.map(item => item.name).join(',');
      aggregatedData.isComplete = item.isComplete;
      aggregatedData.assignedUserIds = item.assignedUserIds;
      aggregatedData.watchedUserIds = item.watchedUserIds;
      aggregatedData.labelIds = item.labelIds;
      aggregatedData.tagIds = item.tagIds;
      aggregatedData.branchIds = item.branchIds;
      aggregatedData.departmentIds = item.departmentIds;
      aggregatedData.modifiedAt = item.modifiedAt;
      aggregatedData.createdAt = item.createdAt;
      aggregatedData.stageChangedDate = item.stageChangedDate;
      aggregatedData.sourceConversationIds = item.sourceConversationIds;
      aggregatedData.status = item.status;
      aggregatedData.name = combinedNames;
      aggregatedData.stageId = item.stageId;
      aggregatedData.customFieldsData = item.customFieldsData;
      aggregatedData.initialStageId = item.initialStageId;
      aggregatedData.modifiedBy = item.modifiedBy;
      aggregatedData.userId = item.userId;
      aggregatedData.searchText = combinedNames;

      if (item.productsData) {
        item.productsData.forEach(product => {
          const existingProduct = aggregatedData.productsData.find(
            p =>
              p.productId === product.productId &&
              p.branchId === product.branchId &&
              p.departmentId === product.departmentId
          );

          if (existingProduct) {
            existingProduct.quantity += product.quantity;
            existingProduct.amount += product.amount;
          } else {
            aggregatedData.productsData.push({
              tax: product.tax,
              taxPercent: product.taxPercent,
              discount: product.discount,
              vatPercent: product.vatPercent,
              discountPercent: product.discountPercent,
              amount: product.amount,
              currency: product.currency,
              tickUsed: product.tickUsed,
              maxQuantity: product.maxQuantity,
              quantity: product.quantity,
              productId: product.productId,
              unitPrice: product.unitPrice,
              globalUnitPrice: product.globalUnitPrice,
              unitPricePercent: product.unitPricePercent
            });
          }

          // Update the total amount for this stage
          aggregatedData.amount.AED += product.amount * product.quantity;
        });
      }
    });
    return aggregatedData;
  } catch (error) {
    return { error: error.message };
  }
};
