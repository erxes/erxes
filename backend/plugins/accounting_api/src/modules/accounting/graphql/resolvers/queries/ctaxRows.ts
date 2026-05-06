import { IContext } from '~/connectionResolvers';
import { CTAX_ROW_STATUS } from '@/accounting/@types/ctaxRow';
import { checkAccountingPermission } from '../../../services/permissionChecker';
import { makeGetUserLevel } from '../../../utils/getUserLevel';

const generateFilterCat = async ({ kinds, searchValue, status }) => {
  const filter: any = {};
  filter.status = { $nin: [CTAX_ROW_STATUS.DELETED] };

  if (status && status !== 'active') {
    filter.status = status;
  }

  if (kinds?.length) {
    filter.kind = { $in: kinds };
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    filter.number = new RegExp(`.*${searchValue}.*`, 'i');
  }

  return filter;
};

const ctaxRowQueries = {
  async ctaxRows(
    _root,
    { accountId, kinds, searchValue, status },
    { models, user, subdomain }: IContext,
  ) {
    if (!accountId) throw new Error('Account ID is required');

    const getUserLevel = makeGetUserLevel(subdomain);
    const { canRead } = await checkAccountingPermission(
      user._id,
      accountId,
      {},
      { Permissions: models.Permissions, Configs: models.Configs as any },
      getUserLevel,
    );
    if (!canRead) return [];

    const filter = await generateFilterCat({ kinds, status, searchValue });
    filter.accountId = accountId; // add account filter

    const sortParams: any = { number: 1 };
    return await models.CtaxRows.find(filter)
      .sort(sortParams)
      .collation({ locale: 'en', numericOrdering: true })
      .lean();
  },

  async ctaxRowsCount(
    _root,
    { accountId, kinds, searchValue, status },
    { models, user, subdomain }: IContext,
  ) {
    if (!accountId) return 0;

    const getUserLevel = makeGetUserLevel(subdomain);
    const { canRead } = await checkAccountingPermission(
      user._id,
      accountId,
      {},
      { Permissions: models.Permissions, Configs: models.Configs as any }, 
      getUserLevel,
    );
    if (!canRead) return 0;

    const filter = await generateFilterCat({ kinds, status, searchValue });
    filter.accountId = accountId;
    return models.CtaxRows.find(filter).countDocuments();
  },

  async ctaxRowDetail(
    _root,
    { _id }: { _id: string },
    { models, user, subdomain }: IContext,
  ) {
    const row = await models.CtaxRows.findOne({ _id }).lean();
    if (!row) throw new Error('CtaxRow not found');

    const accountId = row.accountId;
    if (!accountId) throw new Error('CtaxRow has no associated account');

    const getUserLevel = makeGetUserLevel(subdomain);
    const { canRead } = await checkAccountingPermission(
      user._id,
      accountId,
      {
        createdBy: row.createdBy,
        modifiedBy: row.modifiedBy,
      },
      { Permissions: models.Permissions, Configs: models.Configs as any }, 
      getUserLevel,
    );
    if (!canRead) throw new Error('Access denied');

    return row;
  },
};

export default ctaxRowQueries;