import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { IGroupCommon } from '.';
import { IReportFilterParams } from '../../graphql/resolvers/queries/journalReport';
import { buildJournalReportRecords, generateReportFilters } from './maps';

export const handleMainAC = async (
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
      { baseGroups: ['accountId'] },
    ),
  };
};

export const handleMainACMore = async (
  subdomain: string,
  models: IModels,
  filterParams: IReportFilterParams,
  user: IUserDocument,
) => {
  const { transactionMatch, detailMatch } = await generateReportFilters(
    subdomain,
    models,
    filterParams,
    user,
  );

  return {
    trDetails: await models.Transactions.aggregate([
      { $match: transactionMatch },
      { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
      { $match: detailMatch },
      { $sort: { date: 1 } },
    ]),
  };
};
