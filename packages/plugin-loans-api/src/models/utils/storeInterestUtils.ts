import { IModels } from '../../connectionResolver';
import { IContractDocument } from '../definitions/contracts';
import { IScheduleDocument } from '../definitions/schedules';
import { IStoredInterestDocument } from '../definitions/storedInterest';
import { calcInterest, getDiffDay, getFullDate } from './utils';

export async function storeInterestContract(
  contract: IContractDocument,
  storeDate: Date,
  models: IModels,
  periodLockId: string
) {
  const beginDate = getFullDate(contract.lastStoredDate);
  const invDate = getFullDate(storeDate);

  const lastSchedule = await models.Schedules.findOne({
    payDate: { $lte: invDate }
  })
    .sort({ payDate: -1 })
    .lean<IScheduleDocument>();

  const lastStoredInterest = await models.StoredInterest.findOne({
    invDate: { $lte: invDate }
  })
    .sort({ invDate: -1 })
    .lean<IStoredInterestDocument>();

  if (invDate === lastStoredInterest?.invDate) return;

  if (!lastSchedule) return;

  const diffDay = getDiffDay(beginDate, invDate);

  const storeInterestAmount = calcInterest({
    balance: lastSchedule.balance,
    interestRate: contract.interestRate,
    dayOfMonth: diffDay
  });

  if (storeInterestAmount > 0) {
    await models.StoredInterest.create({
      amount: storeInterestAmount,
      contractId: contract._id,
      invDate: invDate,
      prevStoredDate: contract.lastStoredDate,
      periodLockId,
      number: contract.number
    });

    if (Number.isInteger(contract.storedInterest))
      await models.Contracts.updateOne(
        { _id: contract._id },
        {
          $inc: { storedInterest: storeInterestAmount },
          $set: {
            lastStoredDate: invDate
          }
        }
      );
    else {
      await models.Contracts.updateOne(
        { _id: contract._id },
        {
          $set: {
            lastStoredDate: invDate,
            storedInterest: storeInterestAmount
          }
        }
      );
    }
  }
}
