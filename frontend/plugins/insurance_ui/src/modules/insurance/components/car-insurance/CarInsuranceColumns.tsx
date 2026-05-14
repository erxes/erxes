import { IconCar } from '@tabler/icons-react';
import { createContractColumns } from '../shared';

// Car insurance uses the same contract columns with car icon for product
export const carInsuranceColumns = createContractColumns({
  moreColumnSize: 33,
  productIcon: IconCar,
  columnOrder: [
    'more',
    'checkbox',
    'contractNumber',
    'customer',
    'vendor',
    'product',
    'chargedAmount',
    'startDate',
    'endDate',
    'paymentStatus',
  ],
});
