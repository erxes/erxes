export async function toPreferTransferfTemp(params, registerId) {
  const {
    fromAccount,
    fromAccountName,
    toAccount,
    toAccountName,
    toBank,
    toCurrency,
    description,
    fromCurrency,
    amount,
    refCode,
    type,
  } = params;
  return {
    genericType: null,
    registerNumber: registerId,
    type: type,
    refCode: refCode || '123',
    initiator: {
      genericType: null,
      acctName: fromAccountName,
      acctNo: fromAccount,
      amount: {
        value: Number(amount),
        currency: fromCurrency,
      },
      particulars: description,
      bank: '15',
    },
    receives: [
      {
        genericType: null,
        acctName: toAccountName,
        acctNo: toAccount,
        amount: {
          value: Number(amount),
          currency: toCurrency,
        },
        particulars: description,
        bank: toBank,
      },
    ],
    remarks: description,
  };
}
