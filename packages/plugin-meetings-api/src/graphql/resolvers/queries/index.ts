import meetingQueries from './meeting';
import pinnedUserQueries from './pinnedUser';

export default {
  ...meetingQueries,
  ...pinnedUserQueries
};
