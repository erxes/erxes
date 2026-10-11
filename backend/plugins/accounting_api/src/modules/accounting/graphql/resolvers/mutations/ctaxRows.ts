import { IContext } from '~/connectionResolvers';
import { ICtaxRow } from '@/accounting/@types/ctaxRow';
import {
  validateRequiredId,
  validateRequiredIds,
} from '../../validateRequired';

const ctaxRowsMutations = {
  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async ctaxRowsAdd(
    _root,
    doc: ICtaxRow,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('manageTaxRows');
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
    await checkPermission('manageTaxRows');
    validateRequiredId(_id);
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
    await checkPermission('removeTaxRows');
    validateRequiredIds(ctaxRowIds, 'ctaxRowIds');
    await models.CtaxRows.find({
      _id: { $in: ctaxRowIds },
    }).lean();
    const removed = await models.CtaxRows.removeCtaxRows(ctaxRowIds);

    return removed;
  },
};

export { ctaxRowsMutations };
