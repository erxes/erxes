import { ITimeClockDocument } from '../../models/definitions/timeclock';

export default {
  user(timeclock: ITimeClockDocument) {
    return (
      timeclock.userId && {
        __typename: 'User',
        _id: timeclock.userId
      }
    );
  }
};
