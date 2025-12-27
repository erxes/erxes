import { IContext } from "../../connectionResolver";
import { IScheduleDocument } from "../../models/definitions/schedules";

const Schedules = {
  async interest(schedule: IScheduleDocument) {
    return (schedule.interestEve || 0) + (schedule.interestNonce || 0);
  },
  async didInterest(schedule: IScheduleDocument) {
    return (schedule.didInterestEve || 0) + (schedule.didInterestNonce || 0);
  },
  async contract(
    schedule: IScheduleDocument,
    _: undefined,
    { models }: IContext
  ) {
    if (!schedule.contractId) {
      return null;
    }

    return models.Contracts.findOne({ _id: schedule.contractId });
  },
};

export default Schedules;
