import periodLockMutations from './periodLocks';
import contractMutations from './contracts';
import contractTypeMutations from './contractTypes';
import transactionMutations from './transactions';
import blockMutations from './block';

export default {
  ...periodLockMutations,
  ...contractTypeMutations,
  ...contractMutations,
  ...transactionMutations,
  ...blockMutations
};
