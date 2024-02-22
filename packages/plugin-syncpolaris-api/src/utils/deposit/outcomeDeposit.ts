import {
  customFieldToObject,
  fetchPolaris,
  getCustomer,
  getSavingContract,
} from '../utils';

export const outcomeDeposit = async (subdomain, params) => {
  const transaction = params.object;

  const savingContract = await getSavingContract(
    subdomain,
    transaction.contractId,
  );

  const customer = await getCustomer(subdomain, savingContract.customerId);

  const customerData = await customFieldToObject(
    subdomain,
    'contacts:customer',
    customer,
  );

  const sendData = {
    operCode: '13610010',
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
    tcustRegisterMask: '3',
    tcustContact: customerData.phones[0],
    tranAmt: transaction.total,
    tranCurCode: transaction.currency,
    sourceType: 'OI',
    isPreview: 0,
    isTmw: 1,
    aspParam: [
      [
        {
          acntCode: savingContract.number,
          acntType: 'EXPENSE',
        },
      ],
    ],
  };

  return await fetchPolaris({
    op: '13610010',
    data: [sendData],
    subdomain,
  });
};
