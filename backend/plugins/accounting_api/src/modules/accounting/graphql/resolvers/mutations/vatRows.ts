import { IContext } from "~/connectionResolvers";
import { IVatRow } from "@/accounting/@types/vatRow";

const vatRowsMutations = {
  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async vatRowsAdd(
    _root,
    doc: IVatRow,
    { models }: IContext,
  ) {
    const vatRow =
      await models.VatRows.createVatRow(doc);

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
    { models }: IContext,
  ) {
    await models.VatRows.getVatRow({
      _id,
    });
    const updated = await models.VatRows.updateVatRow(
      _id,
      doc,
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
    { models }: IContext,
  ) {
    await models.VatRows.find({
      _id: { $in: vatRowIds }
    }).lean();
    const removed = await models.VatRows.removeVatRows(vatRowIds);

    return removed;
  },
};

// checkPermission(vatRowsMutations, 'vatRowsAdd', 'manageVatRows');
// checkPermission(vatRowsMutations, 'vatRowsEdit', 'manageVatRows');
// checkPermission(vatRowsMutations, 'vatRowsRemove', 'manageVatRows');

export default vatRowsMutations;
