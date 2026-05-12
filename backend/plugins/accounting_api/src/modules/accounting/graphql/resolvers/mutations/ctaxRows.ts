import { IContext } from '~/connectionResolvers';
import { ICtaxRow } from '@/accounting/@types/ctaxRow';

const ctaxRowsMutations = {
  /**
   * Creates a new CtaxRow
   */
  async ctaxRowsAdd(
    _root,
    doc: ICtaxRow & { accountId: string },
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('manageCtaxRows');

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
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('manageCtaxRows');

    const existing = await models.CtaxRows.findOne({ _id }).lean();
    if (!existing) throw new Error('CtaxRow not found');

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
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('removeCtaxRows');

    const removed = await models.CtaxRows.removeCtaxRows(ctaxRowIds);
    return removed;
  },
};

export default ctaxRowsMutations;