import { IContext } from '~/connectionResolvers';
import { ICtaxRow } from '@/accounting/@types/ctaxRow';
import { checkAccountingPermission } from '../../../services/permissionChecker';
import { makeGetUserLevel } from '../../../utils/getUserLevel';

const ctaxRowsMutations = {
  /**
   * Creates a new CtaxRow
   */
  async ctaxRowsAdd(
    _root,
    doc: ICtaxRow & { accountId: string }, // ensure accountId is passed
    { user, 
      models, 
      subdomain }: IContext,
  ) {
    const { accountId } = doc;
    if (!accountId) throw new Error('Account ID required');

    // Check create permission (any write scope that includes 'add')
    const perm = await models.Permissions.findOne({ userId: user._id, accountId });
    const canCreate = perm && ['add', 'own', 'ltLvl', 'lteLvl', 'gtLvl'].includes(perm.write);
    if (!canCreate) throw new Error('No permission to create CtaxRow');

    // Create with audit fields
    const ctaxRow = await models.CtaxRows.createCtaxRow({
      ...doc,
      createdBy: user._id,
      modifiedBy: user._id,
    });
    return ctaxRow;
  },

  /**
   * Edits a CtaxRow
   */
  async ctaxRowsEdit(
    _root,
    { _id, ...doc }: { _id: string } & ICtaxRow,
    { user, models, subdomain }: IContext,
  ) {
    // Fetch existing row
    const existing = await models.CtaxRows.findOne({ _id }).lean();
    if (!existing) throw new Error('CtaxRow not found');

    const accountId = existing.accountId;
    if (!accountId) throw new Error('CtaxRow has no associated account');

    const getUserLevel = makeGetUserLevel(subdomain);
    const { canWrite } = await checkAccountingPermission(
      user._id,
      accountId,
      {
        createdBy: existing.createdBy,
        modifiedBy: existing.modifiedBy,
      },
       { Permissions: models.Permissions, Configs: models.Configs as any },
      getUserLevel,
    );
    if (!canWrite) throw new Error('Write denied');

    // Update with modifiedBy
    const updated = await models.CtaxRows.updateCtaxRow(_id, {
      ...doc,
      modifiedBy: user._id,
    });
    return updated;
  },

  /**
   * Removes CtaxRows by IDs
   */
  async ctaxRowsRemove(
    _root,
    { ctaxRowIds }: { ctaxRowIds: string[] },
    { user, models, subdomain }: IContext,
  ) {
    // Fetch all rows to check permissions
    const rows = await models.CtaxRows.find({ _id: { $in: ctaxRowIds } }).lean();
    if (!rows.length) throw new Error('No CtaxRows found');

    // Check each row – all must be deletable
    const getUserLevel = makeGetUserLevel(subdomain);
    for (const row of rows) {
      const accountId = row.accountId;
      if (!accountId) throw new Error(`CtaxRow ${row._id} has no account`);

      const { canWrite } = await checkAccountingPermission(
        user._id,
        accountId,
        {
          createdBy: row.createdBy,
          modifiedBy: row.modifiedBy,
        },
        { Permissions: models.Permissions, Configs: models.Configs as any },
        getUserLevel,
      );
      if (!canWrite) throw new Error(`Delete denied for CtaxRow ${row._id}`);
    }

    const removed = await models.CtaxRows.removeCtaxRows(ctaxRowIds);
    return removed;
  },
};

export default ctaxRowsMutations;