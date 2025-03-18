import { SCHEDULE_STATUS } from '../../../models/definitions/constants';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import {
  fixSchedules,
  reGenerateSchedules,
} from '../../../models/utils/scheduleUtils';
import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { getConfig, sendMessageBroker } from '../../../messageBroker';
import { getFullDate } from '../../../models/utils/utils';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { IConfig } from '../../../interfaces/config';

export const loansSchedulesChanged = (contractId: string) => {
  graphqlPubsub.publish(
    `loansSchedulesChanged:${contractId}`,
    {
      loansSchedulesChanged: {
        _id: contractId,
      },
    },
  );
};

const scheduleMutations = {
  regenSchedules: async (
    _root,
    { contractId }: { contractId: string },
    { models, subdomain }: IContext,
  ) => {
    const contract = await models.Contracts.getContract({
      _id: contractId,
    });

    await reGenerateSchedules(subdomain, models, contract);
    await loansSchedulesChanged(contractId);

    if (isEnabled('syncpolaris') && contract.foreignNumber) {
      const schedules = await models.FirstSchedules.find({
        contractId,
      }).lean();

      if (schedules.length > 0) {
        await sendMessageBroker(
          { action: 'changeSchedule', subdomain, data: contract, isRPC: true },
          'syncpolaris',
        );
      } else {
        await sendMessageBroker(
          { action: 'createSchedule', subdomain, data: contract, isRPC: true },
          'syncpolaris',
        );
      }
    }

    return 'ok';
  },

  fixSchedules: async (
    _root,
    { contractId }: { contractId: string },
    { models, subdomain }: IContext,
  ) => {
    const today = getFullDate(new Date());
    const periodLock = await models.PeriodLocks.findOne()
      .sort({ date: -1 })
      .lean();

    const firstSchedules = await models.FirstSchedules.find({
      contractId,
      payDate: periodLock?.date ? { $gt: periodLock?.date } : { $ne: null },
    }).lean();

    await models.Schedules.deleteMany({
      contractId,
      payDate: periodLock?.date ? { $gt: periodLock?.date } : { $ne: null },
    });

    await models.Schedules.insertMany(
      firstSchedules.map(({ _id, ...data }) => data),
    );

    const countSchedules = await models.Schedules.countDocuments({
      contractId: contractId,
      payDate: {
        $lte: new Date(today.getTime() + 1000 * 3600 * 24),
        ...(periodLock?.date ? { $gt: periodLock?.date } : {}),
      },
      status: SCHEDULE_STATUS.PENDING,
      balance: { $gt: 0 },
      isDefault: true,
    });

    const countTransaction = await models.Transactions.countDocuments({
      contractId,
      payDate: periodLock?.date ? { $gt: periodLock?.date } : { $ne: null },
    });

    if (!countSchedules && !countTransaction) return 'ok';

    await fixSchedules(models, contractId, subdomain);
    await loansSchedulesChanged(contractId);

    return 'ok';
  },
};
checkPermission(scheduleMutations, 'regenSchedules', 'manageSchedule');
checkPermission(scheduleMutations, 'fixSchedules', 'manageSchedule');

export default scheduleMutations;
