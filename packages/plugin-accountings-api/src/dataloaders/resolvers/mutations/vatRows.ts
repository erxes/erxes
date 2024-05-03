import { checkPermission } from '@erxes/api-utils/src/permissions';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES,
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { IVATRow } from '../../../models/definitions/vatRow';

interface IVATRowsEdit extends IVATRow {
  _id: string;
}

const vatRowsMutations = {
  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async vatRowsAdd(
    _root,
    doc: IVATRow,
    { user, docModifier, models, subdomain }: IContext,
  ) {
    const vatRow =
      await models.VATRows.createVATRow(docModifier(doc));

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
   * @param {string} param2._id VATRow id
   * @param {Object} param2.doc VATRow info
   */
  async vatRowsEdit(
    _root,
    { _id, ...doc }: IVATRowsEdit,
    { user, models, subdomain }: IContext,
  ) {
    const vatRow = await models.VATRows.getVATRow({
      _id,
    });
    const updated = await models.VATRows.updateVATRow(
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
   * @param {string} param1._id VATRow id
   */
  async vatRowsRemove(
    _root,
    { ids }: { ids: string[] },
    { user, models, subdomain }: IContext,
  ) {
    const vatRow = await models.VATRows.getVATRow({
      ids,
    });
    const removed = await models.VATRows.removeVATRows(ids);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.ACCOUNT_CATEGORY, object: vatRow },
      user,
    );

    return removed;
  },
};

checkPermission(vatRowsMutations, 'vatRowsAdd', 'manageVATRows');
checkPermission(vatRowsMutations, 'vatRowsEdit', 'manageVATRows');
checkPermission(vatRowsMutations, 'vatRowsRemove', 'manageVATRows');

export default vatRowsMutations;
