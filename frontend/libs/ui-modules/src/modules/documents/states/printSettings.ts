import { atomWithStorage } from 'jotai/utils';

export const directPrintEnabledState = atomWithStorage<boolean>(
  'erxes-direct-print-enabled',
  false,
);

export const directPrinterState = atomWithStorage<string>(
  'erxes-direct-printer',
  '',
);
