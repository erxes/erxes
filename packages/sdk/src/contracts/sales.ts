import { defineContract } from './define';
import { salesBaseContract } from './sales/base';
import { salesDealsContract } from './sales/deals';
import { salesPosContract } from './sales/pos';

export const salesContract = defineContract('sales', 1, [
  ...salesBaseContract.entries,
  ...salesDealsContract.entries,
  ...salesPosContract.entries,
]);
