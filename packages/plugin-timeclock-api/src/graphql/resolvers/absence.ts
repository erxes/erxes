import { IAbsenceDocument } from '../../models/definitions/timeclock';

export default {
  user(absence: IAbsenceDocument) {
    return (
      absence.userId && {
        __typename: 'User',
        _id: absence.userId
      }
    );
  }
};
