import customScalars from '@erxes/api-utils/src/customScalars';
import {
  IAbsenceDocument,
  ITimeClockDocument
} from '../../models/definitions/template';
import mutations from './mutations';
import queries from './queries';

const Timeclock = {
  user(timeclock: ITimeClockDocument) {
    return (
      timeclock.userId && {
        __typename: 'User',
        _id: timeclock.userId
      }
    );
  }
};

const Absence = {
  user(absence: IAbsenceDocument) {
    return (
      absence.userId && {
        __typename: 'User',
        _id: absence.userId
      }
    );
  }
};
const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  Timeclock,
  Absence,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
