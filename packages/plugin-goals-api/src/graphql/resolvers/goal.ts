import { IGoalDocument } from '../../models/definitions/goals';

export default {
  createdUser(notif: IGoalDocument) {
    return (
      notif.createdUser && {
        __typename: 'User',
        _id: notif.createdUser
      }
    );
  }
};
