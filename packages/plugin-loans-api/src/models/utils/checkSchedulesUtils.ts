import { IModels } from '../../connectionResolver';
import { SCHEDULE_STATUS } from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import { IScheduleDocument } from '../definitions/schedules';
import { getDiffDay } from './utils';

export async function checkPrePendingSchedules(
  contract: IContractDocument,
  currentDate: Date,
  models: IModels
): Promise<IScheduleDocument | null | undefined> {
  const prePendingSchedules = await models.Schedules.find({
    contractId: contract._id,
    payDate: { $lt: currentDate },
    status:SCHEDULE_STATUS.PENDING
  })
    .sort({ payDate: -1 })
    .lean<IScheduleDocument>();

  if (!prePendingSchedules.length) return;
  const bulkOps:any = []
  for await (const schedule of prePendingSchedules)
  {
    // bulkOps.push({
    //   updateOne: {
    //     filter: { _id: schedule._id },
    //     update: {
    //       $set: { $set: { balance: 1 } }
    //     }
    //   }
    // });
    
    console.log(schedule)
  }
  await models.Schedules.bulkWrite(bulkOps);
}
