import { getConfig } from 'erxes-api-utils';
import { SCHEDULE_STATUS } from '../../../models/definitions/constants';
import { reGenerateSchedules } from '../../../models/utils/scheduleUtils';
import { IPerHoliday } from '../../../models/utils/utils';
import { checkPermission } from '@erxes/api-utils/src';

const scheduleMutations = {
  regenSchedules: async (
    _root,
    { contractId }: { contractId: string },
    { user, models, checkPermission, memoryStorage }
  ) => {
    await checkPermission('saveSchedules', user);
    const doneSchedules = await models.RepaymentSchedules.find({
      contractId,
      status: { $in: [SCHEDULE_STATUS.DONE, SCHEDULE_STATUS.LESS] }
    }).lean();
    if (doneSchedules && doneSchedules.length) {
      const trs = await models.LoanTransactions.find({ contractId }).lean();
      if (trs && trs.length) {
        throw new Error('Schedule has related transaction');
      }
    }

    const holidayConfig = (await getConfig(
      models,
      memoryStorage,
      'holidayConfig',
      {}
    )) as [IPerHoliday];
    const perHolidays = Object.keys(holidayConfig).map(key => ({
      month: Number(holidayConfig[key].month) - 1,
      day: Number(holidayConfig[key].day)
    }));

    const contract = await models.LoanContracts.getContract(models, {
      _id: contractId
    });
    await reGenerateSchedules(models, contract._doc, perHolidays);

    return 'ok';
  }
};
checkPermission(scheduleMutations, 'regenSchedules', 'saveSchedules');

export default scheduleMutations;
