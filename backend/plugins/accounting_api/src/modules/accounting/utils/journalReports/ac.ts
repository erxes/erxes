import { IUserDocument } from "erxes-api-shared/core-types";
import { IModels } from "~/connectionResolvers";
import { generateFilter } from ".";
import { IReportFilterParams } from "../../graphql/resolvers/queries/journalReport";

export const handleMainAC = async (subdomain: string, models: IModels, filterParams: IReportFilterParams, user: IUserDocument) => {
  const { fromDate, toDate, ...filters } = filterParams
  const match = await generateFilter(subdomain, models, filters, user);

  const aggPipe = [
    { $match: match },
    { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
  ];

  const $group = {
    _id: { accountId: '$details.accountId', side: '$details.side' },
    sumAmount: { $sum: '$details.amount' },
    sumCurrencyAmount: { $sum: '$details.currencyAmount' }
  };

  const $project = {
    _id: 0,
    account_id: '$_id.accountId',
    side: '$_id.side',
    sumAmount: 1,
    sumCurrencyAmount: 1,
    isBetween: 1
  };

  const fbRecs = await models.Transactions.aggregate([
    { $match: { date: { $lte: fromDate } } },
    ...aggPipe,
    { $group },
    { $project }
  ]);

  const betRecs = await models.Transactions.aggregate([
    { $match: { date: { $gt: fromDate, $lte: toDate } } },
    ...aggPipe,
    { $group: { ...$group, isBetween: { $sum: 1 } } },
    { $project }
  ]);

  const records = [...fbRecs, ...betRecs];

  const accountIds = records.map(r => r.account_id);
  const accounts = await models.Accounts.find(
    { _id: { $in: accountIds } },
    { _id: 1, code: 1, name: 1, kind: 1, categoryId: 1 }
  ).populate({
    path: 'categoryId',
    model: 'account_categories',
    select: 'code name'
  });

  const accountById = {};
  for (const account of accounts) {
    accountById[account._id] = account;
  }

  return {
    records: records.map(r => ({
      ...r,
      account__code: accountById[r.account_id]?.code,
      account__name: accountById[r.account_id]?.name,
      account__category_id: accountById[r.account_id]?.categoryId?._id,
      account__category__code: accountById[r.account_id]?.categoryId?.code,
      account__category__name: accountById[r.account_id]?.categoryId?.name,
    }))
  }
}
