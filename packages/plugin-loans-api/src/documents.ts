import { generateModels } from './connectionResolver';
import { sendMessageBroker } from './messageBroker';

const toMoney = value => {
  if (!value) {
    return '-';
  }
  return new Intl.NumberFormat().format(value);
};

const fields = [
  { value: 'number', name: 'Contract Number' },
  { value: 'status', name: 'Status' },
  { value: 'description', name: 'Description' },
  { value: 'marginAmount', name: 'Margin Amount', isAmount: true },
  { value: 'leaseAmount', name: 'Lease Amount', isAmount: true },
  { value: 'feeAmount', name: 'Fee Amount', isAmount: true },
  { value: 'tenor', name: 'Tenor' },
  { value: 'interestRate', name: 'interestRate' },
  { value: 'unduePercent', name: 'unduePercent' },
  { value: 'repayment', name: 'repayment' },
  { value: 'startDate', name: 'startDate' },
  { value: 'scheduleDay', name: 'scheduleDay' },
  { value: 'insuranceAmount', name: 'insuranceAmount', isAmount: true },
  { value: 'salvageAmount', name: 'salvageAmount', isAmount: true },
  { value: 'salvagePercent', name: 'salvagePercent' },
  { value: 'salvageTenor', name: 'salvageTenor' },
  { value: 'debt', name: 'Status' },
  { value: 'debtTenor', name: 'debtTenor' },
  { value: 'customerName', name: 'Customer name' },
  { value: 'customerLastName', name: 'Customer last name' },
  { value: 'closeDate', name: 'closeDate' }
];

export default {
  types: [
    {
      type: 'loans',
      label: 'Loans'
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
