import { IAbsenceDocument } from '../../models/definitions/template';

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
