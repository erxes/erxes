import { IContext } from '~/connectionResolvers';
import { ICtaxRow } from '@/accounting/@types/ctaxRow';

const ctaxRowsMutations = {
  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async ctaxRowsAdd(_root, doc: ICtaxRow, { models, checkPermission }: IContext) {
    await checkPermission('manageCtaxRows');
    const ctaxRow = await models.CtaxRows.createCtaxRow(doc);

    return ctaxRow;
  },

  /**
   * Edits a account category
   * @param {string} param2._id CtaxRow id
   * @param {Object} param2.doc CtaxRow info
   */
  async ctaxRowsEdit(
    _root,
    { _id, ...doc }: { _id: string } & ICtaxRow,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('manageCtaxRows');
    await models.CtaxRows.getCtaxRow({
      _id,
    });
    const updated = await models.CtaxRows.updateCtaxRow(_id, doc);
    return updated;
  },

  /**
   * Removes a account category
   * @param {string} param1._id CtaxRow id
   */
  async ctaxRowsRemove(
    _root,
    { ctaxRowIds }: { ctaxRowIds: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('removeCtaxRows');
    await models.CtaxRows.find({
      _id: { $in: ctaxRowIds },
    }).lean();
    const removed = await models.CtaxRows.removeCtaxRows(ctaxRowIds);

    return removed;
  },
};

export default ctaxRowsMutations;
