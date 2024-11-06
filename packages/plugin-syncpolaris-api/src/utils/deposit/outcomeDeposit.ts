import {
  customFieldToObject,
  fetchPolaris,
  sendMessageBrokerData,
} from '../utils';

export const outcomeDeposit = async (subdomain, polarisConfig, params) => {
  const transaction = params.object;

  const savingContract = await sendMessageBrokerData(subdomain, 'savings', 'contracts.findOne', { _id: transaction.contractId })

  const customer = await sendMessageBrokerData(subdomain, 'core', 'customers.findOne', { _id: savingContract.customerId })

  const customerData = await customFieldToObject(
    subdomain,
    "core:customer",
    customer
  );

  const sendData = {
    operCode: "13610010",
    txnAcntCode: savingContract.number,
    txnAmount: transaction.total,
    rate: 1,
    contAmount: transaction.total,
    contCurCode: transaction.currency,
    contRate: 1,
    txnDesc: transaction.description,
    tcustName: customerData.firstName,
    tcustAddr: customerData.firstName,
    tcustRegister: customerData.registerCode,
    tcustRegisterMask: "3",
    tcustContact: customerData.phones[0],
    tranAmt: transaction.total,
    tranCurCode: transaction.currency,
    sourceType: "OI",
    isPreview: 0,
    isTmw: 1,
    aspParam: [
      [
        {
          acntCode: savingContract.number,
          acntType: "EXPENSE"
        }
      ]
    ]
  };

  return await fetchPolaris({
    op: "13610010",
    data: [sendData],
    subdomain,
    polarisConfig,
  });
};
