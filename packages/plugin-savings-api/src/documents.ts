import { generateModels } from './connectionResolver';
import { sendMessageBroker } from './messageBroker';

const toMoney = value => {
  if (!value) {
    return '-';
  }
  return new Intl.NumberFormat().format(value);
};

//document attribute fields
const fields = [
  { value: 'number', name: 'Contract Number' },
  { value: 'status', name: 'Status' },
  { value: 'description', name: 'Description' },
  { value: 'savingAmount', name: 'Saving Amount', isAmount: true },
  { value: 'duration', name: 'Duration' },
  { value: 'interestRate', name: 'interestRate' },
  { value: 'startDate', name: 'startDate' },
  { value: 'customerName', name: 'Customer name' },
  { value: 'customerLastName', name: 'Customer last name' },
  { value: 'closeDate', name: 'closeDate' }
];

export default {
  types: [
    {
      type: 'savings',
      label: 'Savings'
    }
  ],

  editorAttributes: async () => {
    return fields;
  },

  replaceContent: async ({ subdomain, data: { contractId, content } }) => {
    const models = await generateModels(subdomain);
    const contract = await models.Contracts.findOne({ _id: contractId }).lean();

    if (!contract) return content;

    if (contract.customerType === 'customer') {
      const customer = await sendMessageBroker(
        {
          subdomain,
          action: 'customers.findOne',
          data: { _id: contract.customerId },
          isRPC: true
        },
        'contacts'
      );
      contract.customerName = customer.firstName;
      contract.customerLastName = customer.lastName;
    }

    if (contract.customerType === 'company') {
      const company = await sendMessageBroker(
        {
          subdomain,
          action: 'companies.findOne',
          data: { _id: contract.customerId },
          isRPC: true
        },
        'contacts'
      );

      contract.customerName = company.primaryName;
    }

    var printContent = content;
    for await (const row of fields) {
      printContent = printContent.replace(
        RegExp(`{{ ${row.value} }}`, 'g'),
        row.isAmount
          ? toMoney(contract[row.value] || '')
          : contract[row.value] || ''
      );
    }

    return printContent;
  }
};
