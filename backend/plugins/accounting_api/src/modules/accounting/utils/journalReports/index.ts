import { IUserDocument } from 'erxes-api-shared/core-types';
import {
  escapeRegExp,
  getPureDate,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { TR_STATUSES } from '../../@types/constants';
import { IReportFilterParams } from '../../graphql/resolvers/queries/journalReport';
import { handleMainTB } from './tb';
import { handleMainAC } from './ac';

export const getRecords = async (
  subdomain: string,
  models: IModels,
  report: string,
  filterParams: IReportFilterParams,
  user: IUserDocument,
) => {
  const handler = getReportHandler(report);
  if (!handler) throw new Error(`Unsupported journal: ${report}`);

  const { records } = await handler(subdomain, models, filterParams, user);

  return records;
};

const getReportHandler = (report: string) => {
  const handlers: Record<
    string,
    (
      subdomain: string,
      models: IModels,
      filterParams: IReportFilterParams,
      user: IUserDocument,
    ) => Promise<{ records: any[] }>
  > = {
    ac: handleMainAC,
    tb: handleMainTB,
  };

  return handlers[report];
};

export const generateFilter = async (
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
    accountIds,
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
    filter.createdBy = createdUserId;
  }

  if (modifiedUserId) {
    filter.modifiedBy = modifiedUserId;
  }

  if (accountIds?.length) {
    filter['details.accountId'] = { $in: accountIds };
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
    filter.journal = { $in: journals };
  }

  if (journal) {
    filter.journal = journal;
  }

  if (statuses?.length) {
    filter.status = { $in: statuses };
  } else {
    filter.status = { $in: TR_STATUSES.ACTIVE };
  }

  if (number) {
    const regex = new RegExp(`.*${escapeRegExp(number)}.*`, 'i');
    filter.number = { $in: [regex] };
  }

  if (searchValue) {
    const regex = new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i');
    filter.description = regex;
  }

  if (ptrStatus) {
    filter.ptrStatus = ptrStatus;
  }

  if (status) {
    filter.status = status;
  }

  if (brandId) {
    filter.scopeBrandIds = { $in: [brandId] };
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

    filter.branchId = { $in: branches.map((item) => item._id) };
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

    filter.departmentId = { $in: departments.map((item) => item._id) };
  }

  if (currency) {
    filter['details.currency'] = currency;
  }

  return filter;
};
