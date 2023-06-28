import { IContext } from '../../connectionResolver';
import { IShiftDocument } from '../../models/definitions/timeclock';

export default {
  async lunchBreakInMins(shift: IShiftDocument, {}, { models }: IContext, {}) {
    if (shift.lunchBreakInMins) {
      return shift.lunchBreakInMins;
    }

    const getScheduleConfig = await models.ScheduleConfigs.findOne({
      _id: shift.scheduleConfigId
    });

    return getScheduleConfig?.lunchBreakInMins || 0;
  }
};
