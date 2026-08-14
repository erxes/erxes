import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { IReportFilterParams } from '../../../graphql/resolvers/queries/journalReport';
import { getFilter } from '../maps';

export const handleMainACMore = async (
  subdomain: string,
  models: IModels,
  filterParams: IReportFilterParams,
  user: IUserDocument,
) => {
  const { transactionMatch, detailMatch } = await getFilter(
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
