import { generateModels } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';
import * as _ from 'lodash';

const toMoney = value => {
  return new Intl.NumberFormat().format(value);
};

const getCustomFields = async ({ subdomain }) => {
  let fields: any[] = [];

  for (const cardType of ['deal']) {
    let items = await sendCoreMessage({
      subdomain,
      action: 'fields.fieldsCombinedByContentType',
      isRPC: true,
      data: {
        contentType: `sales:${cardType}`
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
  { value: 'totalAmountAfterTaxVat', name: 'Total amount after tax and vat' },
  { value: 'totalAmountWithoutVat', name: 'Total amount without vat' },
  { value: 'discount', name: 'Discount' },
  { value: 'paymentCash', name: 'Payment cash' },
  { value: 'paymentNonCash', name: 'Payment non cash' },
  { value: 'customers.primaryPhone', name: 'customers.primaryPhone' },
  { value: 'customers.primaryEmail', name: 'customers.primaryEmail' }
];

export default {
  types: [
    {
      label: 'Sales',
      type: 'sales',
      subTypes: ['deal', 'stage']
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
    data: {
      stageId,
      itemId,
      content,
      contentype,
      itemIds,
      brandId,
      branchId,
      departmentId
    }
  }) => {
    const models = await generateModels(subdomain);
    const stage = await models.Stages.findOne({ _id: stageId });

    if (!stage) {
      return '';
    }

    let item;
    if (contentype == 'sales:stage') {
      const items = await models.Deals.find({
        stageId: stageId,
        _id: { $in: itemIds.split(',') }
      });

      if (!items) {
        return '';
      }

      item = await salesStage(items);

      if (!item) {
        return '';
      }
    } else {
      item = await models.Deals.findOne({ _id: itemId });

      if (!item) {
        return '';
      }
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

    replacedContent = replacedContent.replace(/{{ stageName }}/g, stage.name);

    if (replacedContent.includes('{{ brandName }}')) {
      if (brandId) {
        const brand = await sendCoreMessage({
          subdomain,
          action: 'brands.findOne',
          data: { _id: brandId },
          isRPC: true
        });

        replacedContent = replacedContent.replace(
          /{{ brandName }}/g,
          brand.name
        );
      }
      replacedContent = replacedContent.replace(/{{ brandName }}/g, '');
    }

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

    if (
      replacedContent.includes('{{ customers }}') ||
      replacedContent.includes('{{ customers.primaryPhone }}') ||
      replacedContent.includes('{{ customers.primaryEmail }}')
    ) {
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

      const activeCustomers = await sendCoreMessage({
        subdomain,
        action: 'customers.findActiveCustomers',
        data: { selector: { _id: { $in: customerIds } } },
        isRPC: true,
        defaultValue: []
      });

      const customerRows: string[] = [];

      for (const item of activeCustomers) {
        const name = await sendCoreMessage({
          subdomain,
          action: 'customers.getCustomerName',
          data: item,
          isRPC: true,
          defaultValue: ''
        });

        customerRows.push(name);
      }
      const customerEmails: string[] = [];
      const customerPhones: string[] = [];

      for (const item of activeCustomers) {
        if (item.primaryEmail) customerEmails.push(item.primaryEmail);
      }
      for (const item of activeCustomers) {
        if (item.primaryPhone) customerPhones.push(item.primaryPhone);
      }
      replacedContent = replacedContent.replace(
        /{{ customers }}/g,
        customerRows.join(',')
      );
      replacedContent = replacedContent.replace(
        /{{ customers.primaryPhone }}/g,
        customerPhones.join(',')
      );
      replacedContent = replacedContent.replace(
        /{{ customers.primaryEmail }}/g,
        customerEmails.join(',')
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

      const activeCompanies = await sendCoreMessage({
        subdomain,
        action: 'companies.findActiveCompanies',
        data: { selector: { _id: { $in: companyIds } } },
        isRPC: true,
        defaultValue: []
      });

      const companyRows: string[] = [];

      for (const item of activeCompanies) {
        const name = await sendCoreMessage({
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

        if (!pd.tickUsed) {
          continue;
        }

        const product = await sendCoreMessage({
          subdomain,
          action: 'products.findOne',
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

        if (
          (branchId && branchId !== 'noBranch' && pd.branchId !== branchId) ||
          (branchId === 'noBranch' && pd.branchId)
        ) {
          continue;
        }

        if (
          (departmentId &&
            departmentId !== 'noDepartment' &&
            pd.departmentId !== departmentId) ||
          (departmentId === 'noDepartment' && pd.departmentId)
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

    let totalAmountAfterTaxVat = 0;
    for (const pd of item.productsData || []) {
      if (!pd?.productId) {
        continue;
      }

      if (!pd.tickUsed) {
        continue;
      }

      const product = await sendCoreMessage({
        subdomain,
        action: 'products.findOne',
        data: { _id: pd.productId },
        isRPC: true
      });

      if (!product) {
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

      const tAmount = pd.amount;

      totalAmountAfterTaxVat += tAmount;
    }

    replacedContent = replacedContent.replace(
      /{{ totalAmountAfterTaxVat }}/g,
      toMoney(totalAmountAfterTaxVat)
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

const salesStage = async (items: any[]) => {
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
        item.productsData
          .filter(product => product.tickUsed)
          .forEach(product => {
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
                unitPricePercent: product.unitPricePercent,
                branchId: product.branchId,
                departmentId: product.departmentId
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
