import { checkPermission } from '@erxes/api-utils/src/permissions';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES,
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { IVatRow } from '../../../models/definitions/vatRow';

interface IVatRowsEdit extends IVatRow {
  _id: string;
}

const vatRowsMutations = {
  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async vatRowsAdd(
    _root,
    doc: IVatRow,
    { user, docModifier, models, subdomain }: IContext,
  ) {
    const vatRow =
      await models.VatRows.createVatRow(docModifier(doc));

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ACCOUNT_CATEGORY,
        newData: { ...doc },
        object: vatRow,
      },
      user,
    );

    return vatRow;
  },

  /**
   * Edits a account category
   * @param {string} param2._id VatRow id
   * @param {Object} param2.doc VatRow info
   */
  async vatRowsEdit(
    _root,
    { _id, ...doc }: IVatRowsEdit,
    { user, models, subdomain }: IContext,
  ) {
    const vatRow = await models.VatRows.getVatRow({
      _id,
    });
    const updated = await models.VatRows.updateVatRow(
      _id,
      doc,
    );

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ACCOUNT_CATEGORY,
        object: vatRow,
        newData: doc,
        updatedDocument: updated,
      },
      user,
    );

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
    const vatRows = await models.VatRows.find({
      _id: { $in: vatRowIds }
    }).lean();
    const removed = await models.VatRows.removeVatRows(vatRowIds);

    for (const vatRow of vatRows) {
      await putDeleteLog(
        models,
        subdomain,
        { type: MODULE_NAMES.ACCOUNT_CATEGORY, object: vatRow },
        user,
      );
    }

    return removed;
  },
};

checkPermission(vatRowsMutations, 'vatRowsAdd', 'manageVatRows');
checkPermission(vatRowsMutations, 'vatRowsEdit', 'manageVatRows');
checkPermission(vatRowsMutations, 'vatRowsRemove', 'manageVatRows');

export default vatRowsMutations;
