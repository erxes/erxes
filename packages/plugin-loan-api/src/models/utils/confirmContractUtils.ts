import { getConfig } from 'erxes-api-utils';
import {
  checkCompanyRd,
  getEbarimtData,
  getJournalsData,
  sentErkhet
} from './confirmUtils';
import { IContractDocument } from '../definitions/contracts';
import { getPureDate } from './utils';

const saveJournals = async (
  models,
  messageBroker,
  contract,
  config,
  journalConfig,
  customerCode
) => {
  const startDate = getPureDate(contract.startDate)
    .toISOString()
    .slice(0, 10);
  const postConfig = {
    defaultCustomer: journalConfig.defaultCustomer
  };
  const orderInfo = {
    orderId: contract._id,
    ptrs: [
      [
        {
          date: startDate,
          bill_number: contract.number,
          description: `Зээл олголт: ${contract.number}`,
          customer: customerCode,
          account: journalConfig.receivable,
          side: 'debit',
          amount: contract.leaseAmount
        },
        {
          date: startDate,
          bill_number: contract.number,
          description: `Зээл олголт: ${contract.number}`,
          customer: customerCode,
          account: journalConfig.temp,
          side: 'credit',
          amount: contract.leaseAmount
        }
      ],
      [
        {
          date: startDate,
          bill_number: contract.number,
          description: `Олголт хийж өглөг бүртгэв: ${contract.number}`,
          customer: customerCode,
          account: journalConfig.temp,
          side: 'debit',
          amount: contract.leaseAmount
        },
        {
          date: startDate,
          bill_number: contract.number,
          description: `Олголт хийж өглөг бүртгэв: ${contract.number}`,
          customer: customerCode,
          account: journalConfig.giving,
          side: 'credit',
          amount: contract.leaseAmount
        }
      ],
      [
        {
          date: startDate,
          bill_number: contract.number,
          description: `Шимтгэл урьдчилж орсон орлого: ${contract.number}`,
          customer: customerCode,
          account: journalConfig.tempDebt,
          side: 'debit',
          amount: contract.feeAmount
        },
        {
          date: startDate,
          bill_number: contract.number,
          description: `Шимтгэл урьдчилж орсон орлого: ${contract.number}`,
          customer: customerCode,
          account: journalConfig.feeIncome,
          side: 'credit',
          amount: contract.feeAmount
        }
      ],
      [
        {
          date: startDate,
          bill_number: contract.number,
          description: `Даатгалын тооцоогоорх өглөг: ${contract.number}`,
          customer: customerCode,
          account: journalConfig.tempDebt,
          side: 'debit',
          amount: contract.insuranceAmount
        },
        {
          date: startDate,
          bill_number: contract.number,
          description: `Даатгалын тооцоогоорх өглөг: ${contract.number}`,
          customer: customerCode,
          account: journalConfig.insuranceGiving,
          side: 'credit',
          amount: contract.insuranceAmount
        }
      ]
    ]
  };

  // future insurance
  if (contract.tenor > 12) {
    const insuranceTypeIds = [
      ...new Set(contract.collateralsData.map(item => item.insuranceTypeId))
    ];
    const insuranceTypes = await models.InsuranceTypes.find({
      _id: { $in: insuranceTypeIds }
    }).lean();
    const insuranceCompanyIds = [
      ...new Set(insuranceTypes.map(item => item.companyId))
    ];
    const insuranceCompanies = await models.Companies.find({
      _id: { $in: insuranceCompanyIds }
    });

    const companyIdBy = {};
    for (const insComp of insuranceCompanies) {
      companyIdBy[insComp._id] = insComp.code;
    }

    const insuranceTypeBy = {};
    for (const insType of insuranceTypes) {
      insuranceTypeBy[insType._id] = companyIdBy[insType.companyId];
    }

    const insuranceGiving = [
      {
        date: startDate,
        description: `Зээл олголт: ${contract.number}`,
        bill_number: contract.number,
        customer: customerCode,
        account: journalConfig.insuranceReceivable,
        side: 'debit',
        amount: ((contract.tenor - 12) / 12) * contract.insuranceAmount
      }
    ];

    for (const coll of contract.collateralsData) {
      const insuAmount =
        ((contract.tenor - 12) / 12) * coll.insuranceAmount || 0;
      if (!insuAmount) {
        continue;
      }

      insuranceGiving.push({
        date: startDate,
        description: `Зээл олголт: ${contract.number} #${coll.certificate}`,
        bill_number: contract.number,
        customer: insuranceTypeBy[coll.insuranceTypeId],
        account: journalConfig.insuranceGiving,
        side: 'credit',
        amount: insuAmount
      });
    }

    orderInfo.ptrs.push(insuranceGiving);
  }

  // future interestEve + interestNonce
  const schedules = await models.RepaymentSchedules.find({
    contractId: contract._id
  });
  const futureInterests = schedules.reduce((a, s) => ({
    interestEve: a.interestEve + s.interestEve,
    interestNonce: a.interestNonce + s.interestNonce
  }));
  const futureInterest =
    futureInterests.interestEve + futureInterests.interestNonce;

  orderInfo.ptrs.push([
    {
      date: startDate,
      bill_number: contract.number,
      description: `ХХүү авлага бүртгэв: ${contract.number}`,
      customer: customerCode,
      account: journalConfig.interestReceivable,
      side: 'debit',
      amount: futureInterest
    },
    {
      date: startDate,
      bill_number: contract.number,
      description: `ХХүү авлага бүртгэв: ${contract.number}`,
      customer: customerCode,
      account: journalConfig.interestGiving,
      side: 'credit',
      amount: futureInterest
    }
  ]);

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
    details.push({
      count: coll.marginAmount / (coll.marginAmount + coll.leaseAmount),
      amount: coll.marginAmount,
      inventoryCode: productsById[coll.collateralId].code,
      discount: 0,
      workerEmail: ''
    });
  }

  const orderInfos = [
    {
      date: getPureDate(contract.startDate)
        .toISOString()
        .slice(0, 10),
      orderId: contract._id,
      number: contract.number,
      hasVat: journalConfig.mainHasVat,
      hasCitytax: journalConfig.mainHasCitytax,
      billType,
      customerCode,
      description: `Эргэн төлөлт ${contract.number}`,
      details,
      debtAmount: contract.marginAmount
    }
  ];
  const postData = await getEbarimtData(config, userEmail, orderInfos);
  return sentErkhet(messageBroker, postData, false, true);
};

export const ConfirmBase = async (
  models,
  messageBroker,
  memoryStorage,
  contract: IContractDocument
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
    models,
    messageBroker,
    contract,
    config,
    journalConfig,
    customerCode
  );
  await models.ErkhetResponses.createErkhetResponse(models, {
    contractId: contract._id,
    isEbarimt: false,
    data: JSON.parse(responseJournals)
  });

  const responseMainPay = await mainPayEbarimt(
    models,
    messageBroker,
    contract,
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

  return { responseJournals, responseMainPay };
};
