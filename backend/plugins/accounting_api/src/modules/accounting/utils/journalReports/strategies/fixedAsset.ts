import { JOURNALS } from '../../../@types/constants';
import { IJournalReportBase } from '../maps';

export const fixedAssetReportBase: IJournalReportBase = {
  code: 'fxa',
  baseGroups: ['fixedAssetId'],
  extraTransactionMatch: {
    journal: {
      $in: [
        JOURNALS.FXA_INCOME,
        JOURNALS.FXA_OUT,
        JOURNALS.FXA_OUT_COST,
        JOURNALS.FXA_OUT_DEPRECIATION,
        JOURNALS.FXA_OUT_LOSS,
        JOURNALS.FXA_MOVE,
        JOURNALS.FXA_MOVE_IN,
        JOURNALS.FXA_SALE,
      ],
    },
  },
  extraDetailMatch: { 'details.fixedAssetId': { $exists: true, $ne: '' } },
  sums: {
    sumAmount: { $sum: '$details.amount' },
    sumCount: { $sum: '$details.count' },
  },
};
