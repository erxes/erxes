import { IUserDocument } from "erxes-api-shared/core-types";
import { IModels } from "~/connectionResolvers";
import { generateFilter } from ".";
import { IReportFilterParams } from "../../graphql/resolvers/queries/journalReport";
import { sendTRPCMessage } from "erxes-api-shared/utils";

export const handleMainAC = async (subdomain: string, models: IModels, filterParams: IReportFilterParams, user: IUserDocument) => {
  const { fromDate, toDate, ...filters } = filterParams
  const match = await generateFilter(subdomain, models, filters, user);

  const aggPipe = [
    { $match: match },
    { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
  ];

  const $group = {
    _id: { accountId: '$details.accountId', side: '$details.side', branchId: '$branchId', departmentId: '$departmentId' },
    sumAmount: { $sum: '$details.amount' },
    sumCurrencyAmount: { $sum: '$details.currencyAmount' }
  };

  const $project = {
    _id: 0,
    accountId: '$_id.accountId',
    side: '$_id.side',
    sumAmount: 1,
    sumCurrencyAmount: 1,
    branchId: '$_id.branchId',
    departmentId: '$_id.departmentId',
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

  const accountIds = records.map(r => r.accountId);
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

  const branchIds = records.map(r => r.branchId);
  const branchById = {};
  const branches = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'branches',
    action: 'find',
    input: {
      query: { _id: { $in: branchIds } },
      fields: {
        _id: 1,
        title: 1,
        code: 1,
      },
    },
    defaultValue: [],
  });
  for (const branch of branches) {
    branchById[branch._id] = branch;
  }

  const departmentIds = records.map(r => r.departmentId);
  const departmentById = {};
  const departments = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'departments',
    action: 'find',
    input: {
      query: { _id: { $in: departmentIds } },
      fields: {
        _id: 1,
        title: 1,
        code: 1,
      },
    },
    defaultValue: [],
  });
  for (const department of departments) {
    departmentById[department._id] = department;
  }

  return {
    records: records.map(r => ({
      ...r,
      accountCode: accountById[r.accountId]?.code,
      accountName: accountById[r.accountId]?.name,
      accountCategoryId: accountById[r.accountId]?.categoryId?._id,
      accountCategoryCode: accountById[r.accountId]?.categoryId?.code,
      accountCategoryName: accountById[r.accountId]?.categoryId?.name,
      branchCode: branchById[r.branchId]?.code,
      branchName: branchById[r.branchId]?.title,
      departmentCode: departmentById[r.departmentId]?.code,
      departmentName: departmentById[r.departmentId]?.title,
    }))
  }
}

export const handleMainACMore = async (subdomain: string, models: IModels, filterParams: IReportFilterParams, user: IUserDocument) => {
  const { ...filters } = filterParams;
  const match = await generateFilter(subdomain, models, filters, user);

  return {
    trDetails: await models.Transactions.aggregate([
      { $match: match },
      { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
      { $match: match },
      { $sort: { date: 1 } }
    ])
  };

}