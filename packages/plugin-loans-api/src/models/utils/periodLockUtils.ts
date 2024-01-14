import { IModels } from '../../connectionResolver';
import { IPeriodLockDocument } from '../definitions/periodLocks';

export async function createPeriodLock(
  date: Date,
  excludeContractIds: string[],
  models: IModels
): Promise<IPeriodLockDocument> {
  const nextLock = await models.PeriodLocks.findOne({
    date: { $gte: date }
  })
    .sort({ date: -1 })
    .lean();
  if (nextLock)
    throw new Error(`Can't lock period at this time because already locked`);

  const doc = {
    createdBy: 'auto',
    createdAt: new Date(),
    date,
    excludeContracts: excludeContractIds
  };

  const periodLock = await models.PeriodLocks.create(doc);

  return periodLock;
}
