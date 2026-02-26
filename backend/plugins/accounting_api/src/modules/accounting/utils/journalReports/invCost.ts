import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { generateFilter, IGroupCommon } from '.';
import { IReportFilterParams } from '../../graphql/resolvers/queries/journalReport';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { JOURNALS } from '../../@types/constants';

export const handleInvCost = async (
  subdomain: string,
  models: IModels,
  groupRules: IGroupCommon[],
  filterParams: IReportFilterParams,
  user: IUserDocument,
) => {
  const groups = new Set(groupRules.map((gr) => gr.group));
  const { fromDate, toDate, ...filters } = filterParams;
  const match = await generateFilter(subdomain, models, filters, user);

  const aggPipe = [
    {
      $match: {
        journal: { $in: JOURNALS.ALL_REAL_INV },
        'details.productId': { $exists: true, $ne: '' },
        ...match,
      },
    },
    { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
  ];

  const $group = {
    _id: {
      accountId: '$details.accountId',
      side: '$details.side',
      productId: '$details.productId',
    },
    sumAmount: { $sum: '$details.amount' },
    sumCount: { $sum: '$details.count' },
    sumCurrencyAmount: { $sum: '$details.currencyAmount' },
  };

  const $project = {
    _id: 0,
    accountId: '$_id.accountId',
    productId: '$_id.productId',
    side: '$_id.side',
    sumAmount: 1,
    sumCount: 1,
    sumCurrencyAmount: 1,
    isBetween: 1,
  };

  if (groups.has('branchId')) {
    $group._id['branchId'] = '$branchId';
    $project['branchId'] = '$_id.branchId';
  }

  if (groups.has('departmentId')) {
    $group._id['departmentId'] = '$departmentId';
    $project['departmentId'] = '$_id.departmentId';
  }

  const fbRecs = await models.Transactions.aggregate([
    { $match: { date: { $lte: fromDate } } },
    ...aggPipe,
    { $group },
    { $project },
  ]);

  const betRecs = await models.Transactions.aggregate([
    { $match: { date: { $gt: fromDate, $lte: toDate } } },
    ...aggPipe,
    { $group: { ...$group, isBetween: { $sum: 1 } } },
    { $project },
  ]);

  const records = [...fbRecs, ...betRecs];

  const accountIds = records.map((r) => r.accountId);
  const accounts = await models.Accounts.find(
    { _id: { $in: accountIds } },
    { _id: 1, code: 1, name: 1, kind: 1, categoryId: 1 },
  ).populate({
    path: 'categoryId',
    model: 'account_categories',
    select: 'code name',
  });

  const accountById = {};
  for (const account of accounts) {
    accountById[account._id] = account;
  }

  const productIds = records.filter((r) => r.productId).map((r) => r.productId);
  const products = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'products',
    action: 'find',
    input: {
      query: { _id: { $in: productIds } },
      fields: { _id: 1, code: 1, name: 1, categoryId: 1 },
      limit: productIds.length,
    },
    defaultValue: [],
  });
  const productById = {};
  for (const product of products) {
    productById[product._id] = product;
  }

  const branchById = {};
  if (groups.has('branchId')) {
    const branchIds = records.map((r) => r.branchId);
    const branches = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
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
  }

  const departmentById = {};
  if (groups.has('departmentId')) {
    const departmentIds = records.map((r) => r.departmentId);
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
  }

  return {
    records: records.map((r) => ({
      ...r,
      accountCode: accountById[r.accountId]?.code,
      accountName: accountById[r.accountId]?.name,
      accountCategoryId: accountById[r.accountId]?.categoryId?._id,
      accountCategoryCode: accountById[r.accountId]?.categoryId?.code,
      accountCategoryName: accountById[r.accountId]?.categoryId?.name,
      productCode: productById[r.productId]?.code,
      productName: productById[r.productId]?.name,
      productCategoryId: productById[r.productId]?.categoryId?._id,
      branchCode: branchById[r.branchId]?.code,
      branchName: branchById[r.branchId]?.title,
      departmentCode: departmentById[r.departmentId]?.code,
      departmentName: departmentById[r.departmentId]?.title,
    })),
  };
};
