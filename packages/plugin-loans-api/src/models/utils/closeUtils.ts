import { IModels } from '../../connectionResolver';
import { getConfig } from '../../messageBroker';
import { SCHEDULE_STATUS } from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import { ISchedule } from '../definitions/schedules';
import { getCalcedAmounts } from './transactionUtils';
import { getFullDate } from './utils';

export const getCloseInfo = async (
  models: IModels,
  subdomain,
  contract: IContractDocument,
  date: Date = new Date()
) => {
  const closeDate = getFullDate(date);
  const contractId = contract._id;
  const config = await getConfig('loansConfig', subdomain);

  let lastPaySchedule: null | Pick<ISchedule, 'payDate' | 'balance'> = await models.Schedules.findOne({
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

  const paymentInfo = await getCalcedAmounts(models, subdomain, {
    contractId,
    payDate: closeDate
  }, config);

  return { ...paymentInfo, interest: paymentInfo.calcInterest + paymentInfo.storedInterest };
};
