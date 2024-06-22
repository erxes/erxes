import periodLockMutations from './periodLocks';
import contractMutations from './contracts';
import contractTypeMutations from './contractTypes';
import insuranceTypeMutations from './insuranceTypes';
import invoiceMutations from './invoices';
import scheduleMutations from './schedules';
import transactionMutations from './transactions';
import classificationMutations from './classification';
import nonBalancetransactionMutations from './nonBalanceTransactions';
import collateralTypeMutations from './collateralTypes';
export default {
  ...periodLockMutations,
  ...contractTypeMutations,
  ...contractMutations,
  ...insuranceTypeMutations,
  ...invoiceMutations,
  ...scheduleMutations,
  ...transactionMutations,
  ...classificationMutations,
  ...nonBalancetransactionMutations,
  ...collateralTypeMutations
};
