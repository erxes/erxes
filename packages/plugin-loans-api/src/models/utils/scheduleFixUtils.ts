import { IModels } from "../../connectionResolver";
import { IConfig } from "../../interfaces/config";
import { IContractDocument } from "../definitions/contracts";
import { IScheduleDocument } from "../definitions/schedules";
import { ITransactionDocument } from "../definitions/transactions";
import { getInterest } from "./interestUtils";
import { calcLoss } from "./lossUtils";
import { getDiffDay } from "./utils";
import { BigNumber } from "bignumber.js";

export async function getMustPayDate(
  scheduleList: IScheduleDocument[],
  lastMustPayDate: Date,
  nextSchedule?: IScheduleDocument | null
) {
  let totalPayedAmount = scheduleList.reduce(
    (a, b) => new BigNumber(a).plus(b.didPayment ?? 0).toNumber(),
    0
  );

  let totalPayedInterest = scheduleList.reduce(
    (a, b) =>
      new BigNumber(a)
        .plus(b.didInterestEve ?? 0)
        .plus(b.didInterestNonce ?? 0)
        .toNumber(),
    0
  );

  let mustPayDate = lastMustPayDate;

  for (let schedule of scheduleList) {
    if (totalPayedAmount > 0 && totalPayedInterest > 0) {
      totalPayedAmount = new BigNumber(totalPayedAmount)
        .minus(schedule.payment ?? 0)
        .toNumber();

      totalPayedInterest = new BigNumber(totalPayedInterest)
        .minus(schedule.interestEve ?? 0)
        .minus(schedule.interestNonce ?? 0)
        .toNumber();
    } else if (schedule.isDefault) {
      mustPayDate = schedule.payDate;
      break;
    }
  }

  if (totalPayedAmount >= 0 && totalPayedInterest >= 0 && nextSchedule)
    mustPayDate = nextSchedule.payDate;

  return mustPayDate;
}

function calcTotalMustPay(totalMustPay, schedule, config) {
  return new BigNumber(totalMustPay)
    .plus(schedule.payment ?? 0)
    .plus(schedule.interestEve ?? 0)
    .plus(schedule.interestNonce ?? 0)
    .plus(schedule.loss ?? 0)
    .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
    .toNumber();
}

function calcTotalPayed(totalPayed, schedule, config) {
  return new BigNumber(totalPayed)
    .plus(schedule.didPayment ?? 0)
    .plus(schedule.didInterestEve ?? 0)
    .plus(schedule.didInterestNonce ?? 0)
    .plus(schedule.didLoss ?? 0)
    .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
    .toNumber();
}

function calcTotalInterestAmount(totalInterestAmount, schedule, config) {
  return new BigNumber(totalInterestAmount)
    .plus(schedule.interestEve ?? 0)
    .plus(schedule.interestNonce ?? 0)
    .minus(schedule.didInterestEve ?? 0)
    .minus(schedule.didInterestNonce ?? 0)
    .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
    .toNumber();
}

export async function getCurrentData(
  contract: IContractDocument,
  currentDate: Date,
  models: IModels,
  config: IConfig
) {
  const scheduleList = await models.Schedules.find({
    contractId: contract._id,
    payDate: { $lte: currentDate }
  })
    .sort({ payDate: 1 })
    .lean();

  let balance = 0;
  let lastDefaultSchedule: any = scheduleList
    .reverse()
    .find((a) => a.isDefault === true && a.payDate !== currentDate);
  let mustPayDate: Date = contract.firstPayDate;
  let totalPaymentAmount = 0;
  let totalInterestAmount = 0;
  let totalMustPay = 0;
  let totalPayed = 0;

  for await (let schedule of scheduleList) {
    if (lastDefaultSchedule.payDate <= schedule.payDate) {
      totalMustPay = calcTotalMustPay(totalMustPay, schedule, config);

      totalPayed = calcTotalPayed(totalPayed, schedule, config);
    }

    if (schedule.status === "give") {
      balance = new BigNumber(schedule.total)
        .plus(balance)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();
    } else {
      totalPaymentAmount = new BigNumber(totalPaymentAmount)
        .plus(schedule.payment ?? 0)
        .minus(schedule.didPayment ?? 0)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();

      totalInterestAmount = calcTotalInterestAmount(
        totalInterestAmount,
        schedule,
        config
      );

      balance = new BigNumber(balance)
        .minus(schedule.didPayment ?? 0)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();
    }
  }

  const expiredPayment = new BigNumber(totalMustPay)
    .minus(totalPayed)
    .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
    .toNumber();

  let loss = 0;
  let preSchedule: IScheduleDocument | undefined = scheduleList.reverse().at(1);

  if (expiredPayment > 0) {
    const diff = getDiffDay(
      preSchedule?.payDate ?? contract.firstPayDate,
      currentDate
    );
    if (diff > 0)
      loss = await calcLoss(
        contract,
        {
          balance: preSchedule?.balance ?? 0,
          payment: totalPaymentAmount,
          interest: totalInterestAmount
        },
        contract.lossPercent || 0,
        diff,
        config
      );
  }
  const nextDefaultSchedule = await models.Schedules.findOne({
    contractId: contract._id,
    payDate: { $gt: currentDate }
  }).sort({ payDate: 1 });

  const { interestEve, interestNonce } = await getInterest(
    contract,
    preSchedule?.payDate ?? contract.startDate,
    currentDate,
    balance,
    config
  );

  mustPayDate = await getMustPayDate(
    scheduleList,
    new Date(), //contract.mustPayDate,
    nextDefaultSchedule
  );

  return {
    interestEve,
    interestNonce,
    loss,
    payment: totalPaymentAmount,
    mustPayDate,
    balance
  };
}

export async function scheduleFixCurrent(
  contract: IContractDocument,
  currentDate: Date,
  models: IModels,
  config: IConfig
) {
  const currentSchedule = await models.Schedules.findOne({
    contractId: contract._id,
    payDate: currentDate,
    isDefault: true
  });

  if (currentSchedule) {
    const { interestEve, interestNonce, loss } = await getCurrentData(
      contract,
      currentDate,
      models,
      config
    );

    await models.Schedules.updateOne(
      { _id: currentSchedule._id },
      {
        $set: { interestEve, interestNonce, loss }
      }
    );
  }
}

export async function scheduleFixAfterCurrent(
  contract: IContractDocument,
  currentDate: Date,
  models: IModels,
  config: IConfig
) {
  const scheduleList = await models.Schedules.find({
    contractId: contract._id
  })
    .sort({ payDate: 1 })
    .lean();

  const updateBulks: any[] = [];

  let balance = 0;
  let preSchedule: any = undefined;

  for await (let schedule of scheduleList) {
    if (schedule.status === "give") {
      balance = new BigNumber(schedule.total ?? 0)
        .plus(balance)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();
      continue;
    }

    if (schedule.payDate > currentDate && preSchedule) {
      const { interestEve, interestNonce } = await getInterest(
        contract,
        preSchedule.payDate,
        schedule.payDate,
        balance,
        config
      );
      if (
        schedule.interestEve !== interestEve ||
        schedule.interestNonce !== interestNonce
      ) {
        updateBulks.push({
          updateOne: {
            filter: {
              _id: schedule._id
            },
            update: {
              $set: {
                interestEve,
                interestNonce
              }
            }
          }
        });
      }
      balance = new BigNumber(balance)
        .minus(schedule.payment || 0)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();
    }

    preSchedule = { ...schedule };

    if (schedule.didPayment && schedule.didPayment > 0)
      balance = new BigNumber(balance)
        .minus(schedule.didPayment)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();
  }

  if (updateBulks.length > 0) await models.Schedules.bulkWrite(updateBulks);
  // let mustPayDate = await getMustPayDate(scheduleList, contract.mustPayDate);
  let mustPayDate = await getMustPayDate(scheduleList, new Date());
  await models.Contracts.updateOne(
    { _id: contract._id },
    { $set: { mustPayDate: mustPayDate } }
  );
}

export async function createTransactionSchedule(
  contract: IContractDocument,
  currentDate: Date,
  tr: ITransactionDocument,
  models: IModels,
  config: IConfig
) {
  let loanBalance = 0;//contract.loanBalanceAmount;

  const currentSchedule = await models.Schedules.findOne({
    contractId: contract._id,
    payDate: tr.payDate
  }).lean();

  if (currentSchedule) {
    await models.Transactions.updateOne(
      { _id: tr._id },
      {
        $set: {
          scheduleId: currentSchedule._id,
          preData: currentSchedule
        }
      }
    );

    await models.Schedules.updateOne(
      {
        _id: currentSchedule._id
      },
      {
        $inc: {
          didStoredInterest: tr.storedInterest,
          didLoss: tr.loss,
          didPayment: tr.payment,
          didCommitmentInterest: tr.commitmentInterest,
          didInterestEve: tr.storedInterest,
          didInterestNonce: tr.calcInterest
        },
        $set: {
          balance: new BigNumber(loanBalance)
            .minus(tr.payment ?? 0)
            .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
            .toNumber()
        },
        $push: {
          transactionIds: tr._id
        }
      }
    );
  } else {
    const { interestEve, interestNonce, balance, loss } = await getCurrentData(
      contract,
      currentDate,
      models,
      config
    );

    const total = interestEve + interestNonce;

    const schedule = await models.Schedules.create({
      createdAt: new Date(),
      contractId: contract._id,
      version: "0",
      payDate: currentDate,
      balance: new BigNumber(balance)
        .minus(tr.payment ?? 0)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber(),
      payment: 0,
      interestEve: interestEve,
      interestNonce: interestNonce,
      loss,
      total: total,
      isDefault: false,
      didStoredInterest: tr.storedInterest,
      didLoss: tr.loss,
      didPayment: tr.payment,
      didCommitmentInterest: tr.commitmentInterest,
      didInterestEve: tr.storedInterest,
      didInterestNonce: tr.calcInterest,
      didTotal: new BigNumber(tr.calcInterest ?? 0)
        .plus(tr.storedInterest ?? 0)
        .plus(tr.payment ?? 0)
        .plus(tr.loss ?? 0)
        .plus(tr.commitmentInterest ?? 0)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber()
    });
    await models.Transactions.updateOne(
      { _id: tr._id },
      {
        $set: {
          reactions: [{ scheduleId: schedule._id }]
        }
      }
    );
  }
}
