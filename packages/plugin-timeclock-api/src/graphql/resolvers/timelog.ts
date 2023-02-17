import { models } from '../../connectionResolver';
import { ITimeLogDocument } from '../../models/definitions/timeclock';

export default {
  user(timelog: ITimeLogDocument) {
    return (
      timelog.userId && {
        __typename: 'User',
        _id: timelog.userId
      }
    );
  },
  async deviceName(timelog: ITimeLogDocument) {
    return (
      timelog.deviceSerialNo &&
      (
        await models?.DeviceConfigs.findOne({
          serialNo: timelog.deviceSerialNo
        })
      )?.deviceName
    );
  }
};
