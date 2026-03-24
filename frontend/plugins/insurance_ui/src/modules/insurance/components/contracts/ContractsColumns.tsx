import { createContractColumns } from '../shared';

// Contracts uses the default contract columns with product before customer
export const contractsColumns = createContractColumns({
  moreColumnSize: 26,
  columnOrder: [
    'more',
    'checkbox',
    'contractNumber',
    'product',
    'customer',
    'vendor',
    'chargedAmount',
    'startDate',
    'endDate',
    'paymentStatus',
  ],
});
