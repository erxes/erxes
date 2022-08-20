const Schedules = {
  interest(schedule) {
    return (schedule.interestEve || 0) + (schedule.interestNonce || 0);
  },
  didInterest(schedule) {
    return (schedule.didInterestEve || 0) + (schedule.didInterestNonce || 0);
  }
};

export default Schedules;
