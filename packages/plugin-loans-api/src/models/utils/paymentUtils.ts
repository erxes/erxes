import { IModels } from '../../connectionResolver';
import { SCHEDULE_STATUS } from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import { IScheduleDocument } from '../definitions/schedules';
import { IStoredInterestDocument } from '../definitions/storedInterest';
import { calcUndue } from '../utils/transactionUtils';
import { calcInterest, getDiffDay } from '../utils/utils';

export interface IPaymentInfo {
  interestEve: number;
  interestNonce: number;
  payment: number;
  calcInterest: number;
  storedInterest: number;
  undue: number;
  debt: number;
  insurance: number;
  commitmentInterest: number;
  payDate: Date;
  expiredDay: number;
  balance: number;
  total: number;
  closeAmount: number;
}

function getValue(value: any, defaultValue: any) {
  return value ?? defaultValue;
}

function getDiffFromLast(
  paymentInfo: IPaymentInfo,
  lastSchedule: IScheduleDocument
) {
  paymentInfo['balance'] = lastSchedule.balance;
  paymentInfo['payment'] =
    getValue(lastSchedule.payment, 0) - getValue(lastSchedule.didPayment, 0);
  paymentInfo['storedInterest'] =
    getValue(lastSchedule.storedInterest, 0) -
    getValue(lastSchedule.didStoredInterest, 0);
  paymentInfo['undue'] =
    getValue(lastSchedule.undue, 0) - getValue(lastSchedule.didUndue, 0);
  paymentInfo['insurance'] =
    getValue(lastSchedule.insurance, 0) -
    getValue(lastSchedule.didInsurance, 0);
  paymentInfo['debt'] =
    getValue(lastSchedule.debt, 0) - getValue(lastSchedule.didDebt, 0);
  paymentInfo['commitmentInterest'] =
    getValue(lastSchedule.commitmentInterest, 0) -
    getValue(lastSchedule.didCommitmentInterest, 0);
  paymentInfo['interestEve'] =
    getValue(lastSchedule.interestEve, 0) -
    getValue(lastSchedule.didInterestEve, 0);
  paymentInfo['interestNonce'] =
    getValue(lastSchedule.interestNonce, 0) -
    getValue(lastSchedule.didInterestNonce, 0);

  return paymentInfo;
}

export async function getPaymentInfo(
  contract: IContractDocument,
  payDate: Date = new Date(),
  models: IModels
): Promise<IPaymentInfo> {
  let paymentInfo: IPaymentInfo = {
    payment: 0,
    calcInterest: 0,
    storedInterest: 0,
    interestEve: 0,
    interestNonce: 0,
    undue: 0,
    insurance: 0,
    debt: 0,
    commitmentInterest: 0,
    payDate: payDate,
    expiredDay: 0,
    balance: 0,
    total: 0,
    closeAmount: 0
  };

  const lastSchedule = await models.Schedules.getLastSchedule(
    contract._id,
    payDate
  );

  paymentInfo = getDiffFromLast(paymentInfo, lastSchedule);

  if (!lastSchedule) return paymentInfo;

  paymentInfo.balance = lastSchedule.balance;

  const diffDay = getDiffDay(lastSchedule.payDate, payDate);
  const diffInterestDay = getDiffDay(lastSchedule.payDate, payDate);

  if (paymentInfo.payment < 0) paymentInfo.payment = 0;
  if (lastSchedule.balance < paymentInfo.payment)
    paymentInfo.payment = lastSchedule.balance;

  const storedInterest = await models.StoredInterest.findOne({
    contractId: contract._id
  })
    .sort({ invDate: -1 })
    .lean<IStoredInterestDocument>();

  if (storedInterest && storedInterest.invDate > lastSchedule.payDate) {
    paymentInfo.storedInterest += storedInterest.amount;
  }

  const interestValue = calcInterest({
    balance: lastSchedule.balance,
    interestRate: contract.interestRate,
    dayOfMonth: diffInterestDay
  });

  paymentInfo.calcInterest = getValue(interestValue, 0);

  //loss calculation from expiration
  if (
    lastSchedule.status === SCHEDULE_STATUS.EXPIRED &&
    contract.unduePercent > 0
  ) {
    paymentInfo.expiredDay = diffDay;

    const loss = await calcUndue(
      lastSchedule,
      contract,
      contract.unduePercent,
      diffDay
    );

    if (loss > 0) paymentInfo.undue += loss;
  }

  if (contract.commitmentInterest > 0) {
    paymentInfo.commitmentInterest =
      getValue(lastSchedule.commitmentInterest, 0) -
      getValue(lastSchedule.didCommitmentInterest, 0);

    const commitmentInterestValue = calcInterest({
      balance: lastSchedule.balance,
      interestRate: contract.interestRate,
      dayOfMonth: diffDay
    });

    if (commitmentInterestValue > 0)
      paymentInfo.commitmentInterest += commitmentInterestValue;
  }

  paymentInfo.insurance =
    getValue(lastSchedule.insurance, 0) -
    getValue(lastSchedule.didInsurance, 0);

  paymentInfo.debt =
    getValue(lastSchedule.debt, 0) - getValue(lastSchedule.didDebt, 0);

  paymentInfo.total =
    paymentInfo.payment +
    paymentInfo.storedInterest +
    paymentInfo.calcInterest +
    paymentInfo.undue +
    paymentInfo.insurance +
    paymentInfo.debt;

  paymentInfo.closeAmount =
    paymentInfo.balance +
    paymentInfo.storedInterest +
    paymentInfo.calcInterest +
    paymentInfo.undue +
    paymentInfo.insurance +
    paymentInfo.debt;

  return paymentInfo;
}

export async function doPayment(
  contract: IContractDocument,
  didPayment: IPaymentInfo,
  models: IModels
) {
  const lastSchedule = await models.Schedules.findOne({
    contractId: contract._id
  })
    .sort({ payDate: -1 })
    .lean<IScheduleDocument>();

  if (lastSchedule?.payDate === didPayment.payDate) {
    lastSchedule.didPayment =
      getValue(lastSchedule.didPayment, 0) + getValue(didPayment.payment, 0);
    lastSchedule.didStoredInterest =
      getValue(lastSchedule.didStoredInterest, 0) +
      getValue(didPayment.storedInterest, 0);
    lastSchedule.didInterestEve =
      getValue(lastSchedule.didInterestEve, 0) +
      getValue(didPayment.calcInterest, 0);
    lastSchedule.didCommitmentInterest =
      getValue(lastSchedule.didCommitmentInterest, 0) +
      getValue(didPayment.commitmentInterest, 0);
    lastSchedule.didUndue =
      getValue(lastSchedule.didUndue, 0) + getValue(didPayment.undue, 0);

    await models.Schedules.updateOne(
      { _id: lastSchedule._id },
      { $set: lastSchedule }
    );
    return;
  }

  const paymentInfo = await getPaymentInfo(
    contract,
    didPayment.payDate,
    models
  );

  const scheduleValue = {
    paymentInfo,
    didPayment: getValue(didPayment.payment, 0),
    didStoredInterest: getValue(didPayment.storedInterest, 0),
    didInterestEve: getValue(didPayment.calcInterest, 0),
    didCommitmentInterest: getValue(didPayment.commitmentInterest, 0),
    didUndue: getValue(didPayment.undue, 0)
  };

  await models.Schedules.create(scheduleValue);
}
