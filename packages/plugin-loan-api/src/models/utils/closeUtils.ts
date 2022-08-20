import { SCHEDULE_STATUS } from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import { getCalcedAmounts } from './transactionUtils';
import { getFullDate } from './utils';

export const getCloseInfo = async (
  models,
  memoryStorage,
  contract: IContractDocument,
  date: Date
) => {
  const closeDate = getFullDate(date);
  const contractId = contract._id;

  let lastPaySchedule = await models.RepaymentSchedules.findOne({
    contractId,
    status: { $in: [SCHEDULE_STATUS.DONE, SCHEDULE_STATUS.LESS] }
  })
    .sort({ payDate: -1 })
    .lean();

  if (!lastPaySchedule) {
    lastPaySchedule = {
      payDate: contract.startDate,
      balance: contract.leaseAmount
    };
  }

  if (lastPaySchedule.payDate > closeDate) {
    throw new Error(`Wrong date: min date is ${lastPaySchedule.payDate}`);
  }

  const {
    undue,
    interestEve,
    interestNonce,
    insurance
  } = (await getCalcedAmounts(models, memoryStorage, {
    contractId,
    payDate: closeDate
  })) as any;

  const pendingSchedules = await models.RepaymentSchedules.find({
    contractId,
    payDate: { $gt: lastPaySchedule.payDate },
    debt: { $exists: true }
  });

  const debt = pendingSchedules.length
    ? pendingSchedules.reduce((a, c) => {
        return { debt: (a.debt || 0) + (c.debt || 0) };
      }).debt
    : 0;

  const result = {
    balance: lastPaySchedule.balance,
    undue,
    interest: (interestEve || 0) + (interestNonce || 0),
    interestEve,
    interestNonce,
    insurance,
    payment: lastPaySchedule.balance,
    debt,
    total:
      lastPaySchedule.balance +
      (undue || 0) +
      (interestEve || 0) +
      (interestNonce || 0) +
      (insurance || 0) +
      debt
  };

  return result;
};
