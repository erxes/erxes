import { SCHEDULE_STATUS } from '../../../models/definitions/constants';
import {
  fixSchedules,
  reGenerateSchedules
} from '../../../models/utils/scheduleUtils';
import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { sendMessageBroker } from '../../../messageBroker';
import { getFullDate } from '../../../models/utils/utils';

const scheduleMutations = {
  regenSchedules: async (
    _root,
    { contractId }: { contractId: string },
    { models, subdomain }: IContext
  ) => {
    const doneSchedules = await models.Schedules.find({
      contractId,
      status: { $in: [SCHEDULE_STATUS.DONE, SCHEDULE_STATUS.LESS] }
    }).lean();
    if (doneSchedules && doneSchedules.length) {
      const trs = await models.Transactions.find({ contractId }).lean();
      if (trs && trs.length) {
        throw new Error('Schedule has related transaction');
      }
    }

    const holidayConfig: any = await sendMessageBroker(
      {
        subdomain,
        action: 'configs.findOne',
        data: {
          query: {
            code: 'holidayConfig'
          }
        },
        isRPC: true
      },
      'core'
    );

    const perHolidays = !holidayConfig?.value
      ? []
      : Object.keys(holidayConfig.value).map(key => ({
          month: Number(holidayConfig.value[key].month) - 1,
          day: Number(holidayConfig.value[key].day)
        }));

    const contract = await models.Contracts.getContract({
      _id: contractId
    });
    await reGenerateSchedules(models, contract, perHolidays);

    return 'ok';
  },
  fixSchedules: async (
    _root,
    { contractId }: { contractId: string },
    { models, subdomain }: IContext
  ) => {
    const today = getFullDate(new Date());
    const periodLock = await models.PeriodLocks.findOne()
      .sort({ date: -1 })
      .lean();

    const firstSchedules = await models.FirstSchedules.find({
      contractId,
      payDate: { $gt: periodLock?.date }
    }).lean();

    await models.Schedules.deleteMany({
      contractId,
      payDate: { $gt: periodLock?.date }
    });

    await models.Schedules.insertMany(
      firstSchedules.map(({ _id, ...data }) => data)
    );

    const countSchedules = await models.Schedules.countDocuments({
      contractId: contractId,
      payDate: {
        $lte: new Date(today.getTime() + 1000 * 3600 * 24),
        $gt: periodLock?.date
      },
      status: SCHEDULE_STATUS.PENDING,
      balance: { $gt: 0 },
      isDefault: true
    });

    const countTransaction = await models.Transactions.countDocuments({
      contractId,
      payDate: { $gt: periodLock?.date }
    });

    if (!countSchedules && !countTransaction) return 'ok';

    await fixSchedules(models, contractId, subdomain);

    return 'ok';
  }
};
checkPermission(scheduleMutations, 'regenSchedules', 'manageSchedule');
checkPermission(scheduleMutations, 'fixSchedules', 'manageSchedule');

export default scheduleMutations;
