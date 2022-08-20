import { getConfig } from 'erxes-api-utils';
import {
  checkCompanyRd,
  getEbarimtData,
  getJournalsData,
  sentErkhet
} from './confirmUtils';
import { IContractDocument } from '../definitions/contracts';
import { ITransactionDocument } from '../definitions/transactions';
import { getPureDate } from './utils';

export interface IConformity {
  mainType: string;
  mainTypeId: string;
  relType: string;
  relTypeId: string;
}

const saveJournals = async (
  messageBroker,
  contract,
  transaction,
  config,
  journalConfig,
  customerCode
) => {
  const trDate = getPureDate(transaction.payDate)
    .toISOString()
    .slice(0, 10);
  const postConfig = {
    defaultCustomer: journalConfig.defaultCustomer
  };
  const orderInfo = {
    orderId: transaction._id,
    ptrs: [
      [
        // FUND_BANK
        {
          date: trDate,
          bill_number: contract.number,
          description: `Эргэн төлөлт: ${transaction.description}`,
          customer: customerCode,
          account: transaction.innerAccount,
          side: 'debit',
          amount: transaction.total - transaction.futureDebt
        },
        {
          date: trDate,
          bill_number: contract.number,
          description: `Эргэн төлөлт: ${transaction.description}`,
          customer: customerCode,
          account: journalConfig.repaymentTemp,
          side: 'credit',
          amount: transaction.total - transaction.futureDebt
        }
      ]
    ]
  };

  if (transaction.futureDebt) {
    orderInfo.ptrs.push([
      {
        date: trDate,
        description: `Эргэн төлөлт: Ирээдүйн авлага`,
        bill_number: contract.number,
        customer: customerCode,
        account: journalConfig.innerAccount, // !авлага данс
        side: 'debit',
        amount: transaction.futureDebt
      },
      {
        date: trDate,
        description: `Эргэн төлөлт: Ирээдүйн авлага`,
        bill_number: contract.number,
        customer: customerCode,
        account: journalConfig.repaymentTemp,
        side: 'credit',
        amount: transaction.futureDebt
      }
    ]);
  }

  // future insurance
  if (transaction.insurance) {
    orderInfo.ptrs.push([
      {
        date: trDate,
        description: `Эргэн төлөлт: Даатгал`,
        bill_number: contract.number,
        customer: customerCode,
        account: journalConfig.repaymentTemp,
        side: 'debit',
        amount: transaction.insurance
      },
      {
        date: trDate,
        description: `Эргэн төлөлт: Даатгал`,
        bill_number: contract.number,
        customer: customerCode,
        account: journalConfig.insuranceReceivable,
        side: 'credit',
        amount: transaction.insurance
      }
    ]);
  }

  if (transaction.interestEve) {
    orderInfo.ptrs.push([
      {
        date: trDate,
        description: `Эргэн төлөлт: Хүүгийн авлага бууруулав`,
        bill_number: contract.number,
        customer: customerCode,
        account: journalConfig.repaymentTemp,
        side: 'debit',
        amount: transaction.interestEve
      },
      {
        date: trDate,
        description: `Эргэн төлөлт: Хүүгийн авлага бууруулав`,
        bill_number: contract.number,
        customer: customerCode,
        account: journalConfig.interestReceivable,
        side: 'credit',
        amount: transaction.interestEve
      }
    ]);
  }

  if (transaction.interestNonce) {
    orderInfo.ptrs.push([
      {
        date: trDate,
        description: `Эргэн төлөлт: Хүүгийн орлого`,
        bill_number: contract.number,
        customer: customerCode,
        account: journalConfig.repaymentTemp,
        side: 'debit',
        amount: transaction.interestNonce
      },
      {
        date: trDate,
        description: `Эргэн төлөлт: Хүүгийн орлого`,
        bill_number: contract.number,
        customer: customerCode,
        account: journalConfig.interestIncome,
        side: 'credit',
        amount: transaction.interestNonce
      }
    ]);
  }

  // future interestEve + interestNonce to close
  if (transaction.interestEve || 0 + transaction.interestNonce || 0) {
    orderInfo.ptrs.push([
      {
        date: trDate,
        bill_number: contract.number,
        description: `Эргэн төлөлт: Хэрэгжээгүй хүү хаалт`,
        customer: customerCode,
        account: journalConfig.interestGiving,
        side: 'debit',
        amount: transaction.interestEve + transaction.interestNonce
      },
      {
        date: trDate,
        bill_number: contract.number,
        description: `Эргэн төлөлт: Хэрэгжээгүй хүү хаалт`,
        customer: customerCode,
        account: journalConfig.interestReceivable,
        side: 'credit',
        amount: transaction.interestEve + transaction.interestNonce
      }
    ]);
  }

  // fee close
  if (transaction.payment) {
    orderInfo.ptrs.push([
      {
        date: trDate,
        bill_number: contract.number,
        description: `Эргэн төлөлт: Шимтгэл урьдчилгаа хаах`,
        customer: customerCode,
        account: journalConfig.interestGiving,
        side: 'debit',
        amount: transaction.interestEve + transaction.interestNonce
      },
      {
        date: trDate,
        bill_number: contract.number,
        description: `Эргэн төлөлт: Шимтгэл урьдчилгаа хаах`,
        customer: customerCode,
        account: journalConfig.interestReceivable,
        side: 'credit',
        amount: transaction.interestEve + transaction.interestNonce
      }
    ]);
  }

  const postData = getJournalsData(
    config,
    journalConfig.userEmail,
    postConfig,
    [orderInfo]
  );
  return sentErkhet(messageBroker, postData, true);
};

const mainPayEbarimt = async (
  models,
  messageBroker,
  contract,
  transaction,
  config,
  journalConfig,
  customerCode,
  billType
) => {
  const userEmail = journalConfig.mainUserEmail;

  const details: any[] = [];
  const collateralIds = contract.collateralsData.map(item => item.collateralId);
  const products = await models.Products.find({
    _id: { $in: collateralIds }
  }).lean();
  const productsById = {};
  for (const product of products) {
    productsById[product._id] = product;
  }

  for (const coll of contract.collateralsData) {
    const perCollAmount =
      ((coll.leaseAmount + coll.marginAmount) /
        (contract.leaseAmount + contract.marginAmount)) *
      transaction.payment;
    details.push({
      count: perCollAmount / (contract.leaseAmount + contract.marginAmount),
      amount: perCollAmount,
      inventoryCode: productsById[coll.collateralId].code,
      discount: 0,
      workerEmail: ''
    });
  }

  const orderInfos = [
    {
      date: getPureDate(transaction.payDate)
        .toISOString()
        .slice(0, 10),
      orderId: transaction._id,
      number: contract.number,
      hasVat: journalConfig.mainHasVat,
      hasCitytax: journalConfig.mainHasCitytax,
      billType,
      customerCode,
      description: `Эргэн төлөлт: Үндсэн төлбөр`,
      details,
      cashAmount: transaction.payment
    }
  ];

  const postData = await getEbarimtData(config, userEmail, orderInfos);
  return sentErkhet(messageBroker, postData, false, true);
};

const undueEbarimt = async (
  messageBroker,
  contract,
  transaction,
  config,
  journalConfig,
  customerCode,
  billType
) => {
  const userEmail = journalConfig.undueUserEmail;

  const details = [
    {
      count: 1,
      amount: transaction.undue,
      inventoryCode: journalConfig.undueStock,
      discount: 0,
      workerEmail: ''
    }
  ];

  const orderInfos = [
    {
      date: getPureDate(transaction.payDate)
        .toISOString()
        .slice(0, 10),
      orderId: `U_${transaction._id}`,
      number: contract.number,
      hasVat: journalConfig.undueHasVat,
      hasCitytax: journalConfig.undueHasCitytax,
      billType,
      customerCode,
      description: `Эргэн төлөлт: Алданги `,
      details,
      cashAmount: transaction.undue
    }
  ];

  const postData = await getEbarimtData(config, userEmail, orderInfos);
  return sentErkhet(messageBroker, postData, false, true);
};

const interestEbarimt = async (
  messageBroker,
  contract,
  transaction,
  config,
  journalConfig,
  customerCode,
  billType
) => {
  const userEmail = journalConfig.undueUserEmail;

  const details = [
    {
      count: 1,
      amount: transaction.interestEve + transaction.interestNonce,
      inventoryCode: journalConfig.interestStock,
      discount: 0,
      workerEmail: ''
    }
  ];

  const orderInfos = [
    {
      date: getPureDate(transaction.payDate)
        .toISOString()
        .slice(0, 10),
      orderId: `I_${transaction._id}`,
      number: contract.number,
      hasVat: false,
      hasCitytax: false,
      billType,
      customerCode,
      description: `Эргэн төлөлт: Хүү`,
      details,
      cashAmount: transaction.undue
    }
  ];

  const postData = await getEbarimtData(config, userEmail, orderInfos);
  return sentErkhet(messageBroker, postData, false, true);
};

export const ConfirmTrBase = async (
  models,
  messageBroker,
  memoryStorage,
  contract: IContractDocument,
  transaction: ITransactionDocument
) => {
  const journalConfig = (
    await models.ContractTypes.findOne({ _id: contract.contractTypeId })
  ).config;
  const config = await getConfig(models, memoryStorage, 'ERKHET', {});
  const { customerCode, billType } = await checkCompanyRd(
    models,
    contract,
    config
  );

  // on Cost
  const responseJournals = await saveJournals(
    messageBroker,
    contract,
    transaction,
    config,
    journalConfig,
    customerCode
  );
  await models.ErkhetResponses.createErkhetResponse(models, {
    contractId: contract._id,
    isEbarimt: false,
    data: JSON.parse(responseJournals)
  });

  if (transaction.payment) {
    const responseMainPay = await mainPayEbarimt(
      models,
      messageBroker,
      contract,
      transaction,
      config,
      journalConfig,
      customerCode,
      billType
    );
    await models.ErkhetResponses.createErkhetResponse(models, {
      contractId: contract._id,
      isEbarimt: true,
      data: JSON.parse(responseMainPay)
    });
  }

  if (transaction.undue) {
    const responseUndue = await undueEbarimt(
      messageBroker,
      contract,
      transaction,
      config,
      journalConfig,
      customerCode,
      billType
    );
    await models.ErkhetResponses.createErkhetResponse(models, {
      contractId: contract._id,
      isEbarimt: true,
      data: JSON.parse(responseUndue)
    });
  }

  if (
    billType === 3 &&
    (transaction.interestEve || transaction.interestNonce)
  ) {
    const responseInterest = await interestEbarimt(
      messageBroker,
      contract,
      transaction,
      config,
      journalConfig,
      customerCode,
      billType
    );
    await models.ErkhetResponses.createErkhetResponse(models, {
      contractId: contract._id,
      isEbarimt: true,
      data: JSON.parse(responseInterest)
    });
  }
};
