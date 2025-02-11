import { checkPermission } from '@erxes/api-utils/src/permissions';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES,
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { ICtaxRow } from '../../../models/definitions/ctaxRow';

interface ICtaxRowsEdit extends ICtaxRow {
  _id: string;
}

const ctaxRowsMutations = {
  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async ctaxRowsAdd(
    _root,
    doc: ICtaxRow,
    { user, docModifier, models, subdomain }: IContext,
  ) {
    const ctaxRow =
      await models.CtaxRows.createCtaxRow(docModifier(doc));

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ACCOUNT_CATEGORY,
        newData: { ...doc },
        object: ctaxRow,
      },
      user,
    );

    return ctaxRow;
  },

  /**
   * Edits a account category
   * @param {string} param2._id CtaxRow id
   * @param {Object} param2.doc CtaxRow info
   */
  async ctaxRowsEdit(
    _root,
    { _id, ...doc }: ICtaxRowsEdit,
    { user, models, subdomain }: IContext,
  ) {
    const ctaxRow = await models.CtaxRows.getCtaxRow({
      _id,
    });
    const updated = await models.CtaxRows.updateCtaxRow(
      _id,
      doc,
    );

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ACCOUNT_CATEGORY,
        object: ctaxRow,
        newData: doc,
        updatedDocument: updated,
      },
      user,
    );

    return updated;
  },

  /**
   * Removes a account category
   * @param {string} param1._id CtaxRow id
   */
  async ctaxRowsRemove(
    _root,
    { ctaxRowIds }: { ctaxRowIds: string[] },
    { user, models, subdomain }: IContext,
  ) {
    const ctaxRows = await models.CtaxRows.find({
      _id: { $in: ctaxRowIds }
    }).lean();
    const removed = await models.CtaxRows.removeCtaxRows(ctaxRowIds);

    for (const ctaxRow of ctaxRows) {
      await putDeleteLog(
        models,
        subdomain,
        { type: MODULE_NAMES.ACCOUNT_CATEGORY, object: ctaxRow },
        user,
      );
    }

    return removed;
  },
};

checkPermission(ctaxRowsMutations, 'ctaxRowsAdd', 'manageCtaxRows');
checkPermission(ctaxRowsMutations, 'ctaxRowsEdit', 'manageCtaxRows');
checkPermission(ctaxRowsMutations, 'ctaxRowsRemove', 'manageCtaxRows');

export default ctaxRowsMutations;
