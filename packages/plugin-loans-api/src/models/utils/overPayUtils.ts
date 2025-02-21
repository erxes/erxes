import { BigNumber } from 'bignumber.js';
import { calcInterest, getDatesDiffMonth, getDiffDay, getFullDate } from "./utils";
import { getFreezeAmount } from './calcHelpers';
import { IScheduleDocument } from '../definitions/schedules';
import { IContractDocument } from '../definitions/contracts';
import { IModels } from '../../connectionResolver';
import { REPAYMENT } from '../definitions/constants';

const fixFutureSchedulesNext = async (models, contract, currentSchedule, futureSchedules, currentDate, diffPayment, calculationFixed) => {
  let indBalance = currentSchedule.didBalance ?? 0;

  for (const afterCurrentSchedule of futureSchedules) {
    if (diffPayment <= 0) {
      break;
    }
    const diffDay = getDiffDay(currentDate, afterCurrentSchedule.payDate)

    const interest = calcInterest({
      balance: indBalance,
      interestRate: afterCurrentSchedule.interestRate ?? contract.interestRate,
      dayOfMonth: diffDay,
      fixed: calculationFixed
    });

    const { diffEve } = getDatesDiffMonth(currentDate, afterCurrentSchedule.payDate);

    const calcedInterestEve = calcInterest({
      balance: indBalance,
      interestRate: afterCurrentSchedule.interestRate ?? contract.interestRate,
      dayOfMonth: diffEve,
      fixed: calculationFixed
    });

    const calcedInterestNonce = new BigNumber(interest).minus(calcedInterestEve).dp(calculationFixed, BigNumber.ROUND_HALF_UP).toNumber()
    let currPayment = 0;
    if (diffPayment < (afterCurrentSchedule.payment ?? 0)) {
      currPayment = (afterCurrentSchedule.payment ?? 0) - diffPayment
    }

    indBalance = indBalance - currPayment


    await models.Schedules.updateOne({ _id: afterCurrentSchedule._id }, {
      $set: {
        interestEve: calcedInterestEve,
        interestNonce: calcedInterestNonce,
        payment: currPayment,
        balance: indBalance,
        total: calcedInterestEve + calcedInterestNonce + currPayment

      }
    })

    diffPayment = diffPayment - (afterCurrentSchedule.payment ?? 0);
  }
}

const fixFutureSchedulesLast = async (models: IModels, contract: IContractDocument, currentSchedule, futureSchedules, currentDate, diffPayment, calculationFixed) => {
  let loopBeforeSchedule = currentSchedule;

  for (const futureSch of futureSchedules) {
    const betweenDay = getDiffDay(loopBeforeSchedule.payDate, futureSch.payDate);

    const commitmentInterest = calcInterest({
      balance: loopBeforeSchedule.unUsedBalance || 0,
      interestRate: loopBeforeSchedule.interestRate ?? contract.interestRate,
      dayOfMonth: betweenDay,
      fixed: calculationFixed
    });

    const interest = calcInterest({
      balance: loopBeforeSchedule.didBalance || loopBeforeSchedule.balance,
      interestRate: loopBeforeSchedule.interestRate ?? contract.interestRate,
      dayOfMonth: betweenDay,
      fixed: calculationFixed
    });

    const { diffEve } = getDatesDiffMonth(loopBeforeSchedule.payDate, currentDate);

    const calcedInterestEve = calcInterest({
      balance: loopBeforeSchedule.didBalance || loopBeforeSchedule.balance,
      interestRate: loopBeforeSchedule.interestRate ?? contract.interestRate,
      dayOfMonth: diffEve,
      fixed: calculationFixed
    });

    const calcedInterestNonce = new BigNumber(interest).minus(calcedInterestEve).dp(calculationFixed, BigNumber.ROUND_HALF_UP).toNumber();

    let payment = 0;
    let total = 0;

    if (contract.repayment === REPAYMENT.FIXED) {
      total = futureSch.total
      payment = total - interest - futureSch.insurance;
    } else {
      payment = futureSch.payment;
      total = payment + interest + futureSch.insurance;
    }

    if (loopBeforeSchedule.balance > payment) {
      payment = loopBeforeSchedule.balance;
      total = payment + interest + futureSch.insurance;
    }

    await models.Schedules.updateOne({ _id: futureSch._id }, {
      $set: {
        loss: 0,
        interestEve: calcedInterestEve,
        interestNonce: calcedInterestNonce,
        storedInterest: 0,
        commitmentInterest,
        payment,
        total
      }
    });

    loopBeforeSchedule = await models.Schedules.findOne({ _id: futureSch._id }).lean();
  }
}

const fixFutureSchedulesImpact = async (models, contract, currentSchedule, futureSchedules, currentDate, diffPayment, calculationFixed) => {
  if (contract.overPaymentIsNext) {
    await fixFutureSchedulesNext(models, contract, currentSchedule, futureSchedules, currentDate, diffPayment, calculationFixed)
  } else {
    await fixFutureSchedulesLast(models, contract, currentSchedule, futureSchedules, currentDate, diffPayment, calculationFixed)
  }
}


export const overPaymentFutureImpact = async (models, contract, didPayment, amountInfos, trPayDate, currentDate, currentSchedule, preSchedule, calculationFixed) => {
  let futureSchedules = await models.Schedules.find({
    contractId: contract._id,
    payDate: { $gt: getFullDate(trPayDate) }
  }).sort({ payDate: 1, createdAt: 1 }).lean();

  let diffPayment = didPayment - amountInfos.payment;

  if (futureSchedules.length) {
    // ireeduin huvaari baigaa buguud ene udaagiinh ni huvaariin bus udur bol daraagiin huvaariin huug nuushluh
    if (!currentSchedule.isDefault) {
      const nextSchedule = futureSchedules[0];
      const nextDiffDay = getDiffDay(trPayDate, nextSchedule.payDate);
      const freezeNextScheduleInterest = await getFreezeAmount(didPayment, didPayment, preSchedule.didBalance, preSchedule.interestRate ?? contract.interestRate, nextDiffDay, calculationFixed);

      // daraa sard nuutsulj bui huu ni tulsun - tuluh yostoi yalgavraas ih baival l nuutsluy
      if (freezeNextScheduleInterest < diffPayment) {
        await models.Schedules.updateOne({ _id: currentSchedule._id }, {
          $set: {
            freezeAmount: freezeNextScheduleInterest,
            didPayment: (currentSchedule.didPayment ?? 0) - freezeNextScheduleInterest,
            didBalance: (currentSchedule.didBalance ?? 0) + freezeNextScheduleInterest
          }
        });

        const interest = calcInterest({
          balance: preSchedule.didBalance || preSchedule.balance,
          interestRate: preSchedule.interestRate ?? contract.interestRate,
          dayOfMonth: nextDiffDay,
          fixed: calculationFixed
        });

        const { diffEve } = getDatesDiffMonth(preSchedule.payDate, currentDate);

        const calcedInterestEve = calcInterest({
          balance: preSchedule.didBalance || preSchedule.balance,
          interestRate: preSchedule.interestRate ?? contract.interestRate,
          dayOfMonth: diffEve,
          fixed: calculationFixed
        });

        const calcedInterestNonce = new BigNumber(interest).minus(calcedInterestEve).dp(calculationFixed, BigNumber.ROUND_HALF_UP).toNumber();

        await models.Schedules.updateOne({ _id: nextSchedule._id }, {
          $set: {
            payment: 0,
            balance: (currentSchedule.didBalance ?? 0) + freezeNextScheduleInterest,
            interestEve: calcedInterestEve,
            interestNonce: calcedInterestNonce,
          }
        });

        currentSchedule = await models.Schedules.findOne({ _id: nextSchedule }).lean() as IScheduleDocument;
        futureSchedules = futureSchedules.filter(fs => fs._id !== nextSchedule._id);
        currentDate = getFullDate(nextSchedule.payDate)
      }
    }

    await fixFutureSchedulesImpact(models, contract, currentSchedule, futureSchedules, currentDate, diffPayment, calculationFixed);
  } else {
    await models.Schedules.updateMany({ _id: currentSchedule._id }, { $set: { surplus: diffPayment } });
  }
}