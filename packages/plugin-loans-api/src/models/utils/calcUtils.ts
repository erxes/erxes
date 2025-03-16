import { BigNumber } from 'bignumber.js';
import { IModels } from '../../connectionResolver';
import { IConfig } from '../../interfaces/config';
import { getConfig } from '../../messageBroker';
import { SCHEDULE_STATUS } from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import { ITransactionDocument } from '../definitions/transactions';
import { generateSchedules, insuranceHelper, scheduleHelper } from './scheduleUtils';
import { getDiffDay, getFullDate } from './utils';
import { ISchedule, IScheduleDocument } from '../definitions/schedules';
import { getAmountByPriority, getCalcedAmountsOnDate } from './calcHelpers';
import { overPaymentFutureImpact } from './overPayUtils';


const firstGiveTr = async (subdomain, models: IModels, contract: IContractDocument, tr: ITransactionDocument) => {
  const unUsedBalance = new BigNumber(contract.leaseAmount).minus(tr.total).toNumber()
  await models.Schedules.create({
    contractId: contract._id,
    status: SCHEDULE_STATUS.GIVE,
    payDate: getFullDate(tr.payDate),
    balance: new BigNumber(tr.total || 0).toNumber(),
    didBalance: new BigNumber(tr.total || 0).toNumber(),
    unUsedBalance,
    interestEve: 0,
    interestNonce: 0,
    storedInterest: 0,
    commitmentInterest: 0,
    loss: 0,
    payment: 0,
    transactionIds: [tr._id],
    total: 0,
    giveAmount: tr.total
  });

  contract.leaseAmount = tr.total;
  contract.startDate = getFullDate(tr.payDate);
  const bulkEntries = await generateSchedules(subdomain, models, contract, unUsedBalance);

  await models.Schedules.insertMany(bulkEntries.map(b => ({ ...b, isDefault: true, unUsedBalance })));
}

const fixFutureSchedulesGive = async (subdomain, models: IModels, contract: IContractDocument, currentSchedule: ISchedule, futureSchedules: ISchedule[]) => {
  const dateRanges = futureSchedules.map(fsh => fsh.payDate);

  const mainConfigs = await getConfig('loansConfig', subdomain, {});

  const unUsedBalance = currentSchedule.unUsedBalance;
  contract.stepRules?.filter(sr => sr.firstPayDate > currentSchedule.payDate)

  let bulkEntries: any[] = [];
  let balance = currentSchedule.didBalance || currentSchedule.balance;
  let startDate: Date = getFullDate(currentSchedule.payDate);
  let tenor = futureSchedules.length;

  if (contract.stepRules?.length) {
    for (const stepRule of contract.stepRules.sort((a, b) => a.firstPayDate.getTime() - b.firstPayDate.getTime())) {
      if (!stepRule.salvageAmount) {
        if (stepRule.totalMainAmount) {
          stepRule.salvageAmount = balance - stepRule.totalMainAmount;
        }

        if (stepRule.mainPayPerMonth) {
          stepRule.salvageAmount = balance - (stepRule.mainPayPerMonth * stepRule.tenor)
        }
      }

      bulkEntries = await scheduleHelper(
        bulkEntries,
        {
          contractId: contract._id,
          repayment: contract.repayment,
          startDate,
          balance,
          interestRate: stepRule.interestRate ?? contract.interestRate,
          tenor: stepRule.tenor,
          salvageAmount: stepRule.salvageAmount || 0,
          skipInterestCalcMonth: stepRule.skipInterestCalcMonth,
          skipInterestCalcDay: stepRule.skipInterestCalcDay,
          skipAmountCalcMonth: stepRule.skipAmountCalcMonth,
          skipAmountCalcDay: stepRule.skipAmountCalcDay,
          dateRanges
        },
        mainConfigs.calculationFixed,
      )

      if (bulkEntries.length) {
        const preEntry: any = bulkEntries[bulkEntries.length - 1];
        startDate = preEntry.payDate;
        balance = preEntry.balance;
      }
      tenor = tenor - stepRule.tenor
    }
  }

  if (tenor > 0) {
    bulkEntries = await scheduleHelper(
      bulkEntries,
      {
        contractId: contract._id,
        repayment: contract.repayment,
        startDate,
        balance,
        interestRate: contract.interestRate,
        tenor,
        salvageAmount: 0,
        unUsedBalance,
        skipInterestCalcMonth: !bulkEntries.length && contract.skipInterestCalcMonth || undefined,
        skipInterestCalcDay: !bulkEntries.length && contract.skipInterestCalcDay || undefined,
        skipAmountCalcMonth: !bulkEntries.length && contract.skipAmountCalcMonth || undefined,
        skipAmountCalcDay: !bulkEntries.length && contract.skipAmountCalcDay || undefined,
        dateRanges
      },
      mainConfigs.calculationFixed
    )
  }

  // insurance schedule
  const insuranceTypeIds = (contract.collateralsData || []).map(
    coll => coll.insuranceTypeId
  );
  (contract.insurancesData || []).map(ins => ins.insuranceTypeId)

  const insuranceTypes = await models.InsuranceTypes.find({
    _id: { $in: insuranceTypeIds }
  });
  const insuranceTypeRulesById = {};
  for (const insType of insuranceTypes) {
    insuranceTypeRulesById[insType._id] = insType;
  }

  let insuranceIndex = 0;
  let first10 = 0;
  let on11 = 0;
  let monthCounter = 1;

  while (insuranceIndex < bulkEntries.length - 12) {
    const currentYear = parseInt(String(insuranceIndex / 12)) + 1;
    if (monthCounter === 1) {
      const helper = insuranceHelper(
        contract,
        insuranceTypeRulesById,
        currentYear
      );
      first10 = helper.first10;
      on11 = helper.on11;
    }
    if (monthCounter === 12) {
      monthCounter = 1;
      insuranceIndex += 1;
      continue;
    }

    const monthInsurance = monthCounter === 11 ? on11 : first10;
    bulkEntries[insuranceIndex].insurance = monthInsurance;
    bulkEntries[insuranceIndex].total += monthInsurance;

    insuranceIndex += 1;
    monthCounter += 1;
  }

  if (contract.debt) {
    const debtTenor =
      Math.min(contract.debtTenor || 0, bulkEntries.length) || 1;

    const perDebt = Math.round(contract.debt / debtTenor);
    const firstDebt = contract.debt - perDebt * (debtTenor - 1);

    let monthDebt = perDebt;
    for (let i = 0; i < debtTenor; i++) {
      monthDebt = i === 0 ? firstDebt : perDebt;
      bulkEntries[i].debt = monthDebt;
      bulkEntries[i].total += monthDebt;
    }
  }

  const sumStoredInterest = (currentSchedule.interestEve ?? 0) + (currentSchedule.interestNonce ?? 0) + (currentSchedule.storedInterest ?? 0);
  if (sumStoredInterest && bulkEntries.length) {
    bulkEntries[0].storedInterest = (bulkEntries[0].storedInterest ?? 0) + sumStoredInterest;
    bulkEntries[0].total = (bulkEntries[0].total ?? 0) + sumStoredInterest;
  }

  return bulkEntries
}

export const afterGiveTrInSchedule = async (subdomain, models: IModels, contract: IContractDocument, tr: ITransactionDocument, calculationFixed = 2) => {
  const alreadySchedules = await models.Schedules.findOne({ contractId: contract._id }).lean();

  if (!alreadySchedules?._id) {
    await firstGiveTr(subdomain, models, contract, tr);
    return;
  }

  const amounts = await getCalcedAmountsOnDate(models, contract, tr.payDate, calculationFixed);

  let unUsedBalance = new BigNumber(amounts.unUsedBalance).minus(tr.total).toNumber();
  if (unUsedBalance < 0) {
    // hetrelt baij bolzoshgui shalgah
    unUsedBalance = 0;
  }

  const currentSchedule = await models.Schedules.create({
    contractId: contract._id,
    status: SCHEDULE_STATUS.GIVE,
    payDate: getFullDate(tr.payDate),
    balance: new BigNumber(tr.total || 0).plus(amounts.balance).toNumber(),
    didBalance: new BigNumber(tr.total || 0).plus(amounts.didBalance).toNumber(),
    unUsedBalance,
    interestEve: amounts.interestEve ?? 0,
    interestNonce: amounts.interestNonce ?? 0,
    storedInterest: amounts.storedInterest ?? 0,
    commitmentInterest: amounts.commitmentInterest ?? 0,
    insurance: amounts.insurance ?? 0,
    debt: amounts.debt ?? 0,
    payment: amounts.payment ?? 0,
    transactionIds: [tr._id],
    total: 0,
    giveAmount: tr.total
  });

  const futureSchedules: IScheduleDocument[] = await models.Schedules.find({
    contractId: contract._id,
    payDate: { $gt: getFullDate(currentSchedule.payDate) }
  }).sort({ payDate: 1, createdAt: 1 }).lean();

  const bulkEntries = await fixFutureSchedulesGive(subdomain, models, contract, currentSchedule, futureSchedules);
  const updateBulkOps: {
    updateOne: {
      filter: { _id: string };
      update: any;
      upsert: true;
    };
  }[] = [];

  let index = 0
  for (const futureSch of futureSchedules) {
    const updInfos = bulkEntries[index]
    updateBulkOps.push({
      updateOne: {
        filter: { _id: futureSch._id },
        update: { $set: { ...updInfos } },
        upsert: true
      }
    });

    index++;
  }

  await models.Schedules.bulkWrite(updateBulkOps);
}

export const afterPayTrInSchedule = async (models: IModels, contract: IContractDocument, tr: ITransactionDocument, config) => {
  let currentDate = getFullDate(tr.payDate);

  const calculationFixed = config.calculationFixed || 2

  const amountInfos = await getCalcedAmountsOnDate(models, contract, currentDate, calculationFixed);
  const { preSchedule, skippedSchedules } = amountInfos;

  if (!preSchedule) {
    return;
  }

  let surplus = 0;
  const didInfo = getAmountByPriority(
    tr.total, { ...amountInfos }
  );

  const { didDebt, didLoss, didStoredInterest, didInterestEve, didInterestNonce, didInsurance, didPayment } = didInfo;
  let status = didInfo.status;

  // payment iig tulvul balance uldeh yostoi baidgaas undeslev
  let didBalance = (preSchedule.didBalance ?? 0) - didPayment
  if (didBalance <= 0) {
    status = SCHEDULE_STATUS.COMPLETE;
    surplus = didBalance * -1
    didBalance = 0;
  }

  let currentSchedule = !getDiffDay(preSchedule?.payDate, currentDate) ?
    preSchedule :
    skippedSchedules?.find(ss => !getDiffDay(ss.payDate, currentDate));

  if (currentSchedule) {
    await models.Schedules.updateOne({
      _id: currentSchedule._id
    }, {
      $set: {
        status,
        didDebt,
        didLoss,
        didStoredInterest,
        didInterestEve,
        didInterestNonce,
        didInsurance,
        didPayment,
        didBalance,
        didTotal: tr.total,
        surplus
      },
      $addToSet: { transactionIds: tr._id }
    })
    currentSchedule = (await models.Schedules.findOne({ _id: currentSchedule._id }).lean()) as IScheduleDocument;
  } else {
    currentSchedule = await models.Schedules.create({
      contractId: contract._id,
      status,
      isDefault: false,
      payDate: getFullDate(tr.payDate),
      interestRate: preSchedule.interestRate,

      balance: amountInfos.balance,
      unUsedBalance: amountInfos.unUsedBalance,

      loss: amountInfos.loss,
      interestEve: amountInfos.interestEve,
      interestNonce: amountInfos.interestNonce,
      storedInterest: amountInfos.storedInterest,
      commitmentInterest: amountInfos.commitmentInterest,
      payment: amountInfos.payment,
      insurance: amountInfos.insurance,
      debt: amountInfos.debt,
      total: amountInfos.total,

      didDebt,
      didLoss,
      didStoredInterest,
      didInterestEve,
      didInterestNonce,
      didInsurance,
      didPayment,
      didBalance,
      didTotal: tr.total,
      surplus,
      transactionIds: [tr._id]
    })
  }

  const updStatusSchedules = skippedSchedules?.filter(ss => getDiffDay(ss.payDate, currentDate));
  if (updStatusSchedules?.length) {
    await models.Schedules.updateMany({ _id: { $in: updStatusSchedules.map(u => u._id) } }, { $set: { status: SCHEDULE_STATUS.SKIPPED } });
  }

  if (amountInfos.payment < didPayment) {
    await overPaymentFutureImpact(models, contract, didPayment, amountInfos, getFullDate(tr.payDate), currentDate, currentSchedule, preSchedule, calculationFixed)
  }
}

export const trInSchedule = async (subdomain: string, models: IModels, contract: IContractDocument, tr: ITransactionDocument) => {
  const config: IConfig = await getConfig("loansConfig", subdomain, {});
  if (tr.transactionType === 'give') {
    afterGiveTrInSchedule(subdomain, models, contract, tr, config.calculationFixed)
  } else {
    afterPayTrInSchedule(models, contract, tr, config)
  }
}
