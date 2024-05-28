import { generateModels } from './connectionResolver';

import { sendCommonMessage } from './messageBroker';

export default {
  editorAttributes: async () => {
    return [
      { value: 'createdAt', name: 'Created at' },
      { value: 'customerName', name: 'Customer name' },
      { value: 'buildingName', name: 'Building name' }
    ];
  },

  replaceContent: async ({ subdomain, data: { contractId, content } }) => {
    const models = await generateModels(subdomain);

    const contract = await models.Contracts.findOne({ _id: contractId });

    if (!contract) {
      return [content];
    }

    const building = await models.Buildings.findOne({
      _id: contract.buildingId
    });

    if (!building) {
      return [content];
    }

    const customer = await sendCommonMessage({
      subdomain,
      serviceName: 'contacts',
      action: 'customers.findOne',
      isRPC: true,
      data: {
        _id: contract.customerId
      }
    });

    if (!customer) {
      return [content];
    }

    let replacedContent = content;

    replacedContent = replacedContent.replace(
      /{{ createdAt }}/g,
      contract.createdAt.toLocaleDateString()
    );

    replacedContent = replacedContent.replace(
      /{{ customerName }}/g,
      `${customer.firstName || ''} ${customer.lastName}`
    );

    replacedContent = replacedContent.replace(
      /{{ buildingName }}/g,
      building.name
    );

    return [replacedContent];
  }
};
