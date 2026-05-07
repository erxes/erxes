import { IContext } from '~/connectionResolvers';
import { IVatRow } from '@/accounting/@types/vatRow';
import { checkAccountingPermission } from '../../../services/permissionChecker';
import { makeGetUserLevel } from '../../../utils/getUserLevel';

const vatRowsMutations = {
  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async vatRowsAdd(_root, doc: IVatRow & { accountId: string }, { user, models, subdomain }: IContext) {
    const { accountId } = doc;
    if (!accountId) throw new Error('Account ID required');

    const getUserLevel = makeGetUserLevel(subdomain);
    const { canWrite } = await checkAccountingPermission(
      user._id,
      accountId,
      {}, // empty targetRecord – account‑level write check
      { Permissions: models.Permissions, Configs: models.Configs as any },
      getUserLevel,
    );
    if (!canWrite) throw new Error('No permission to create VatRow');

    const vatRow = await models.VatRows.createVatRow({
      ...doc,
      createdBy: user._id,
      modifiedBy: user._id,
    });
    return vatRow;
  },

  /**
   * Edits a account category
   * @param {string} param2._id VatRow id
   * @param {Object} param2.doc VatRow info
   */
  async vatRowsEdit(
    _root,
    { _id, ...doc }: { _id: string } & IVatRow,
    { user, models, subdomain }: IContext,
  ) {
    // Fetch existing row
    const existing = await models.VatRows.findOne({ _id }).lean();
    if (!existing) throw new Error('VatRow not found');

    const accountId = existing.accountId;
    if (!accountId) throw new Error('VatRow has no associated account');

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

    const updated = await models.VatRows.updateVatRow(_id, {
      ...doc,
      modifiedBy: user._id,
    });
    return updated;
  },

  /**
   * Removes a account category
   * @param {string} param1._id VatRow id
   */
  async vatRowsRemove(
    _root,
    { vatRowIds }: { vatRowIds: string[] },
    { user, models, subdomain }: IContext,
  ) {
    const rows = await models.VatRows.find({ _id: { $in: vatRowIds } }).lean();
    if (!rows.length) throw new Error('No VatRows found');

    const getUserLevel = makeGetUserLevel(subdomain);
    for (const row of rows) {
      const accountId = row.accountId;
      if (!accountId) throw new Error(`VatRow ${row._id} has no account`);

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
      if (!canWrite) throw new Error(`Delete denied for VatRow ${row._id}`);
    }

    const removed = await models.VatRows.removeVatRows(vatRowIds);
    return removed;
  },
};

export default vatRowsMutations;