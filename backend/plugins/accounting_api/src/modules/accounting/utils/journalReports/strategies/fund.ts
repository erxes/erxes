import { JOURNALS } from '../../../@types/constants';
import { IJournalReportBase } from '../maps';

export const fundReportBase: IJournalReportBase = {
  code: 'fund',
  baseGroups: ['accountId'],
  extraTransactionMatch: { journal: { $in: [JOURNALS.CASH, JOURNALS.BANK] } },
  supportsMore: true,
};
