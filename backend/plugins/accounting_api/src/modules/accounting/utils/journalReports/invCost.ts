import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { IGroupCommon } from '.';
import { IReportFilterParams } from '../../graphql/resolvers/queries/journalReport';
import { JOURNALS } from '../../@types/constants';
import { buildJournalReportRecords } from './maps';

export const handleInvCost = async (
  subdomain: string,
  models: IModels,
  groupRules: IGroupCommon[],
  filterParams: IReportFilterParams,
  user: IUserDocument,
) => {
  return {
    records: await buildJournalReportRecords(
      subdomain,
      models,
      groupRules,
      filterParams,
      user,
      {
        baseGroups: ['accountId', 'productId'],
        extraTransactionMatch: { journal: { $in: JOURNALS.ALL_REAL_INV } },
        extraDetailMatch: { 'details.productId': { $exists: true, $ne: '' } },
        sums: {
          sumAmount: { $sum: '$details.amount' },
          sumCount: { $sum: '$details.count' },
          sumCurrencyAmount: { $sum: '$details.currencyAmount' },
        },
      },
    ),
  };
};
