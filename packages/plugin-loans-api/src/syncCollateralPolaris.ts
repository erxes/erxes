const http = require('http');

const nanoid = (len = 21) => {
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  let randomString = '';

  for (let i = 0; i < len; i++) {
    const position = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(position, position + 1);
  }

  return randomString;
};

const getMostFrequentPaymentDay = async (schedule) => {
  if (!Array.isArray(schedule) || schedule.length === 0) {
    throw new Error('Invalid schedule data');
  }

  const dayCounts = {};

  schedule.forEach((item) => {
    const day = new Date(item.schdDate).getDate();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });

  return Object.keys(dayCounts).reduce((a, b) =>
    dayCounts[a] > dayCounts[b] ? a : b
  );
};

const fetchPolaris = async (op, body) => {
  const headers = {
    Op: op,
    Cookie: `NESSESSION=03tv40BnPzFEEcGgsFxkhrAUTN7Awh`,
    Company: '13',
    Role: '45',
    'Content-Type': 'application/json'
  };
  const url = `http://202.131.242.158:4139/nesWeb/NesFront`;
  const requestOptions = {
    url,
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    agent: new http.Agent({ keepAlive: true })
  };

  const realResponse = await fetch(url, requestOptions)
    .then(async (response) => {
      if (!response.ok) {
        const respErr = await response.text();
        throw new Error(respErr);
      }

      return response.text();
    })
    .then((response) => {
      try {
        return JSON.parse(response);
      } catch (e) {
        return response;
      }
    })
    .catch((e) => {
      throw new Error(e.message);
    });

  return realResponse;
};

export const syncCollateral = async (
  ProductCategories,
  Products,
  collaterals,
  document
) => {
  if (collaterals.length > 0) {
    document.collateralsData = [];

    for (const item of collaterals) {
      const detailCollateral = await fetchPolaris('13610906', [item.acntCode]);

      const product = await Products.findOne({
        code: item.acntCode
      });

      if (!product) {
        let categoryId;
        const findCategory = await ProductCategories.findOne({
          code: detailCollateral.acntCode
        });

        if (findCategory) {
          categoryId = findCategory._id;
        } else {
          const createCategory = await ProductCategories.insertOne({
            _id: nanoid(),
            name: `${item.acntName} ${item.linkTypeName}`,
            code: detailCollateral.acntCode,
            order: `${detailCollateral.acntCode}/`,
            status: 'active',
            createdAt: new Date()
          });

          categoryId = createCategory.insertedId;
        }

        const createProduct = await Products.insertOne({
          _id: nanoid(),
          name: `${item.acntName} ${item.linkTypeName}`,
          code: item.acntCode,
          unitPrice: detailCollateral.price,
          categoryId,
          createdAt: new Date()
        });

        document.collateralsData.push({
          _id: nanoid(),
          collateralId: createProduct.insertedId,
          cost: detailCollateral.price,
          percent: 0,
          marginAmount: 0,
          leaseAmount: item.useAmount,
          currency: item.useCurCode,
          certificate: detailCollateral.key2,
          vinNumber: detailCollateral.key
        });
      } else {
        // Optional: If you want to handle case when product exists
        document.collateralsData.push({
          _id: nanoid(),
          collateralId: product._id,
          cost: detailCollateral.useAmount,
          percent: 0,
          marginAmount: 0,
          leaseAmount: item.useAmount,
          currency: item.useCurCode,
          certificate: detailCollateral.key2,
          vinNumber: detailCollateral.key
        });
      }
    }
  }

  return document;
};

export const syncSchedules = async (
  LoanFirstSchedules,
  LoanContracts,
  pLoanSchedules,
  loanContract
) => {
  const schedules = pLoanSchedules.map((schedule) => ({
    _id: nanoid(),
    contractId: loanContract.insertedId.toString(),
    status: 'pending',
    payDate: new Date(schedule.schdDate),
    balance: schedule.totalAmount,
    interestNonce: schedule.intAmount,
    payment: schedule.totalAmount,
    total: schedule.totalAmount
  }));

  await LoanFirstSchedules.insertMany(schedules);

  await LoanContracts.updateOne(
    { _id: loanContract.insertedId },
    {
      $set: {
        firstPayDate: new Date(pLoanSchedules[0].schdDate),
        scheduleDays: [await getMostFrequentPaymentDay(pLoanSchedules)]
      }
    }
  );
};

export const syncTransactions = async (
  huulga,
  LoanTransaction,
  loanContract
) => {
  for (const data of huulga.txns) {
    const doc = {
      _id: nanoid(),
      contractId: loanContract.insertedId,
      payDate: new Date(data.postDate),
      description: data.txnDesc,
      currency: data.curCode,
      payment: data.income,
      transactionType: 'repayment'
    };

    await LoanTransaction.insertOne({ ...doc });
  }
};
