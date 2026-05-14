import { IContext } from '~/connectionResolvers';
import { generateFilter, IAccountQueryParams } from './accounts';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { ACCOUNT_PERMISSION_SCOPES, ACCOUNT_PERMISSION_WRITE_SCOPES } from '~/modules/accounting/@types/permission';

const genFilter = (params: IPermQueryParams) => {
  const {
    minLvl, maxLvl, reads, writes,
  } = params;
  const filter: any = {};
  if (minLvl) {
    if (!filter.level) {
      filter.level = {};
    }
    filter.level.$gte = minLvl;
  }
  if (maxLvl) {
    if (!filter.level) {
      filter.level = {};
    }
    filter.level.$lte = maxLvl;
  }

  if (reads?.length) {
    filter.read = { $in: reads }
  }

  if (writes?.length) {
    filter.write = { $in: writes }
  }
  return filter;
}

interface IPermQueryParams {
  userId?: string,
  minLvl?: number, maxLvl?: number,
  reads?: string[], writes?: string[]
}

const accountPermissionsQueries = {
  async accountPermissions(
    _root,
    params: IAccountQueryParams & ICursorPaginateParams & IPermQueryParams,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('readAccountPermissions');

    const { userId, minLvl, maxLvl, reads, writes, ...accountParams } = params;

    const accountFilter = await generateFilter(models, accountParams, user);

    const filter = genFilter({ userId, minLvl, maxLvl, reads, writes });

    params.orderBy ??= { code: 1 };

    if (userId && !Object.keys(filter).length) {
      const resultAccounts = await cursorPaginate({
        model: models.Accounts,
        params,
        query: accountFilter,
      });

      const permissions = await models.Permissions.find({ userId, accountId: { $in: resultAccounts.list.map(acc => acc._id) } });
      const permByAccId = {};
      for (const perm of permissions) {
        permByAccId[perm.accountId] = perm
      }

      return {
        ...resultAccounts,
        list: resultAccounts.list.map(account => ({
          _id: account._id,
          userId,
          accountId: account._id,
          level: permByAccId[account._id]?.level || 0,
          read: permByAccId[account._id]?.read || ACCOUNT_PERMISSION_SCOPES.NONE,
          write: permByAccId[account._id]?.write || ACCOUNT_PERMISSION_WRITE_SCOPES.NONE,
          
        }))
      }
    }

    const accounts = await models.Accounts.find(accountFilter, { _id: 1, code: 1, name: 1 }).lean();
    if (accounts.length) {
      filter.accountId = { $in: accounts.map(acc => acc._id) }
    }

    return await cursorPaginate({
      model: models.Permissions,
      params,
      query: { ...filter },
    });
  },
};

export default accountPermissionsQueries;
