import customScalars from '@erxes/api-utils/src/customScalars';
import {
  calendarBoard as CalendarBoard,
  calendarGroup as CalendarGroup,
} from './calendar';
import calendarMutations from './calendarsMutations';
import calendarQueries from './calendarsQueries';

const resolvers: any = {
  ...customScalars,
  CalendarGroup,
  CalendarBoard,
  Mutation: {
    ...calendarMutations,
  },
  Query: {
    ...calendarQueries,
  },
};

export default resolvers;
