import { IContext } from '~/connectionResolvers';
import { IVatRow } from '@/accounting/@types/vatRow';

const vatRowsMutations = {
  /**
   * Creates a new VatRow
   */
  async vatRowsAdd(
    _root,
    doc: IVatRow & { accountId: string },
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('manageVatRows');

    const vatRow = await models.VatRows.createVatRow({
      ...doc,
      createdBy: user._id,
      modifiedBy: user._id,
    });

    return vatRow;
  },

  /**
   * Edits a VatRow
   */
  async vatRowsEdit(
    _root,
    { _id, ...doc }: { _id: string } & IVatRow,
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('manageVatRows');

    const existing = await models.VatRows.findOne({ _id }).lean();
    if (!existing) throw new Error('VatRow not found');

    const updated = await models.VatRows.updateVatRow(_id, {
      ...doc,
      modifiedBy: user._id,
    });

    return updated;
  },

  /**
   * Removes VatRows by IDs
   */
  async vatRowsRemove(
    _root,
    { vatRowIds }: { vatRowIds: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('removeVatRows');

    const removed = await models.VatRows.removeVatRows(vatRowIds);
    return removed;
  },
};

export default vatRowsMutations;