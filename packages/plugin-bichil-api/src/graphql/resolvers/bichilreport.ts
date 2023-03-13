import { IUserReport } from '../../models/definitions/timeclock';

export default {
  user(userReport: IUserReport) {
    return (
      userReport.userId && {
        __typename: 'User',
        _id: userReport.userId
      }
    );
  }
};
