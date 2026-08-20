import { JOURNALS } from '../../../@types/constants';
import { IJournalReportBase } from '../maps';

export const debtReportBase: IJournalReportBase = {
  code: 'debt',
  baseGroups: ['customerId', 'accountId'],
  extraTransactionMatch: {
    journal: { $in: [JOURNALS.RECEIVABLE, JOURNALS.PAYABLE] },
  },
  supportsMore: true,
};
