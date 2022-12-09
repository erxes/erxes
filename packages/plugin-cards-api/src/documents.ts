import { generateModels } from './connectionResolver';
import {
  sendContactsMessage,
  sendCoreMessage,
  sendProductsMessage
} from './messageBroker';

export default {
  editorAttributes: async () => {
    return [
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
      { value: 'totalAmountWithoutVat', name: 'Total amount without vat' }
    ];
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
      `{{ createdAt }}`,
      item.createdAt.toLocaleDateString()
    );

    if (item.closeDate) {
      replacedContent = replacedContent.replace(
        `{{ closeDate }}`,
        item.closeDate.toLocaleDateString()
      );
    }

    replacedContent = replacedContent.replace(
      `{{ now }}`,
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
      '{{ assignedUsers }}',
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
        '{{ customers }}',
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
        '{{ companies }}',
        companyRows.join(',')
      );
    }

    const replaceProducts = async (key, type) => {
      let totalAmount = 0;

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

        productRows.push(`
        <tr>
          <td>${index}</td>
          <td>${product.code || ''}</td>
          <td>${product.name}</td>
          <td>${pd.quantity}</td>
          <td>${pd.unitPrice}</td>
          <td>${tAmount}</td>
        </tr>
     `);
      }

      replacedContent = replacedContent.replace(
        key,
        productRows.length > 0
          ? `
        <table>
          <tbody>
            <thead>
              <tr>
                <th>№</th>
                <th>Code</th>
                <th>${type === 'product' ? 'Product name' : 'Service name'}</th>
                <th>Quantity</th>
                <th>Unit price</th>
                <th>Total amount</th>
              </tr>
            </thead>
            ${productRows}
          </tbody>
        </table>

        <script>
          window.print();
        </script>
      `
          : ''
      );

      return totalAmount;
    };

    const productsTotalAmount = await replaceProducts(
      '{{ productsInfo }}',
      'product'
    );
    const servicesTotalAmount = await replaceProducts(
      '{{ servicesInfo }}',
      'service'
    );
    const totalAmount = productsTotalAmount + servicesTotalAmount;
    const totalAmountVat = (totalAmount * 10) / 100;
    const totalAmountWithoutVat = totalAmount - totalAmountVat;

    replacedContent = replacedContent.replace(
      '{{ productTotalAmount }}',
      productsTotalAmount
    );
    replacedContent = replacedContent.replace(
      '{{ servicesTotalAmount }}',
      servicesTotalAmount
    );
    replacedContent = replacedContent.replace('{{ totalAmount }}', totalAmount);
    replacedContent = replacedContent.replace(
      '{{ totalAmountVat }}',
      totalAmountVat
    );
    replacedContent = replacedContent.replace(
      '{{ totalAmountWithoutVat }}',
      totalAmountWithoutVat
    );

    return replacedContent;
  }
};
