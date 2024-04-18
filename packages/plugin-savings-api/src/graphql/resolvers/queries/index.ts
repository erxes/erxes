import periodLockQueries from './periodLocks';
import contractQueries from './contracts';
import contractTypeQueries from './contractTypes';
import transactionQueries from './transactions';
import blockQueries from './block';

export default {
  ...periodLockQueries,
  ...contractTypeQueries,
  ...contractQueries,
  ...transactionQueries,
  ...blockQueries
};
