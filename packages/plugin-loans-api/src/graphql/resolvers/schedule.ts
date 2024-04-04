import { IScheduleDocument } from '../../models/definitions/schedules';

const Schedules = {
  interest(schedule: IScheduleDocument) {
    return (schedule.interestEve || 0) + (schedule.interestNonce || 0);
  },
  didInterest(schedule: IScheduleDocument) {
    return (schedule.didInterestEve || 0) + (schedule.didInterestNonce || 0);
  }
};

export default Schedules;
