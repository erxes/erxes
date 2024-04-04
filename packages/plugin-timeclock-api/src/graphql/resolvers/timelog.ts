import { ITimeLogDocument } from '../../models/definitions/timeclock';

export default {
  user(timelog: ITimeLogDocument) {
    return (
      timelog.userId && {
        __typename: 'User',
        _id: timelog.userId,
      }
    );
  },
  async deviceName(timelog: ITimeLogDocument, _, { models }) {
    return (
      timelog.deviceSerialNo &&
      (
        await models?.DeviceConfigs.findOne({
          serialNo: timelog.deviceSerialNo,
        })
      )?.deviceName
    );
  },
};
