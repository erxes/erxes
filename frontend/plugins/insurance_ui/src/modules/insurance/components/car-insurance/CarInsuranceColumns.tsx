import { IconCar } from '@tabler/icons-react';
import { createContractColumns } from '../shared';

// Car insurance uses the same contract columns with car icon for product
export const carInsuranceColumns = (
  t: (key: string, defaultValue?: string) => string,
) =>
  createContractColumns(t, {
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
