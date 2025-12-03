import { IModels } from "~/connectionResolvers";
import { IReportFilterParams } from "../graphql/resolvers/queries/journalReport";
import { IUserDocument } from "erxes-api-shared/core-types";
import { escapeRegExp, getPureDate, sendTRPCMessage } from "erxes-api-shared/utils";
import { TR_STATUSES } from "../@types/constants";

export const getRecords = async (subdomain: string, models: IModels, report: string, filterParams: IReportFilterParams, user: IUserDocument) => {
  const handler = await getReportHandler(report);
  if (!handler) throw new Error(`Unsupported journal: ${report}`);

  const { records } = await handler(subdomain, models, filterParams, user);

  return records;
}

const getReportHandler = async (report) => {
  const handlers: Record<
    string,
    (
      subdomain: string,
      models: IModels,
      filterParams: IReportFilterParams,
      user: IUserDocument
    ) => Promise<{ records: any[] }>
  > = {
    ac: handleMainAC,
    tb: handleMainTB,
  };

  return handlers[report];
}

const handleMainAC = async (subdomain: string, models: IModels, filterParams: IReportFilterParams, user: IUserDocument) => {
  return { records: [] }
}

const handleMainTB = async (subdomain: string, models: IModels, filterParams: IReportFilterParams, user: IUserDocument) => {
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

const generateFilter = async (
  subdomain: string,
  models: IModels,
  params: IReportFilterParams,
  user: IUserDocument,
) => {
  const {
    searchValue,
    number,
    journal,
    journals,
    brandId,
    branchId,
    departmentId,
    currency,
    statuses,
    ptrStatus,
    status,
    createdUserId,
    modifiedUserId,
    fromDate,
    toDate,
  } = params;
  const filter: any = {};

  if (createdUserId) {
    filter.createdBy = createdUserId
  }

  if (modifiedUserId) {
    filter.modifiedBy = modifiedUserId
  }

  const dateQry: any = {};
  if (fromDate) {
    dateQry.$gte = getPureDate(fromDate);
  }
  if (toDate) {
    dateQry.$lte = getPureDate(toDate);
  }
  if (Object.keys(dateQry).length) {
    filter.date = dateQry;
  }

  if (journals?.length) {
    filter.journal = { $in: journals }
  }

  if (journal) {
    filter.journal = journal
  }

  if (statuses?.length) {
    filter.status = { $in: statuses }
  } else {
    filter.status = { $in: TR_STATUSES.ACTIVE }
  }

  if (number) {
    const regex = new RegExp(`.*${escapeRegExp(number)}.*`, 'i');
    filter.number = { $in: [regex] };
  }

  if (searchValue) {
    const regex = new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i');
    filter.description = { $in: [regex] };
  }

  if (ptrStatus) {
    filter.ptrStatus = ptrStatus;
  }

  if (status) {
    filter.status = status;
  }

  if (brandId) {
    filter.scopeBrandIds = { $in: [brandId] }
  }

  if (branchId) {
    const branches = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'branches',
      action: 'findWithChild',
      input: {
        query: { _id: branchId },
        fields: { _id: 1 },
      },
      defaultValue: [],
    });

    filter.branchId = { $in: branches.map((item) => item._id) }
  }

  if (departmentId) {
    const departments = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'departments',
      action: 'findWithChild',
      input: {
        query: { _id: departmentId },
        fields: { _id: 1 },
      },
      defaultValue: [],
    });

    filter.departmentId = { $in: departments.map((item) => item._id) }
  }

  if (currency) {
    filter['details.currency'] = currency;
  }

  return filter;
};