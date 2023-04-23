import { IContext } from '../../connectionResolver';
import { IScheduleConfigDocument } from '../../models/definitions/timeclock';
import { fixDate } from '@erxes/api-utils/src';

export default {
  async configDays(
    scheduleConfig: IScheduleConfigDocument,
    {},
    { models }: IContext,
    {}
  ) {
    return models.Shifts.find({
      scheduleConfigId: scheduleConfig._id,
      scheduleId: { $exists: false }
    });
  }
};
