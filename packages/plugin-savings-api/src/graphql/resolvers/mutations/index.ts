import periodLockMutations from './periodLocks';
import contractMutations from './contracts';
import contractTypeMutations from './contractTypes';
import transactionMutations from './transactions';

export default {
  ...periodLockMutations,
  ...contractTypeMutations,
  ...contractMutations,
  ...transactionMutations
};
