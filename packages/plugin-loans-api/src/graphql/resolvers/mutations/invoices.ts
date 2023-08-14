import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import {
  IInvoice,
  IInvoiceDocument
} from '../../../models/definitions/invoices';
import { createLog, deleteLog, updateLog } from '../../../logUtils';

const invoiceMutations = {
  loanInvoicesAdd: async (
    _root,
    doc: IInvoice,
    { user, models, subdomain }: IContext
  ) => {
    if (!(doc.companyId || doc.customerId)) {
      throw new Error('must choose customer or company');
    }

    const invoice = await models.Invoices.createInvoice(doc);

    const logData = {
      type: 'invoice',
      newData: doc,
      object: invoice,
      extraParams: { models }
    };

    await createLog(subdomain, user, logData);

    return invoice;
  },
  /**
   * Updates a invoice
   */

  loanInvoicesEdit: async (
    _root,
    { _id, ...doc }: IInvoiceDocument,
    { models, user, subdomain }: IContext
  ) => {
    if (!(doc.companyId || doc.customerId)) {
      throw new Error('must choose customer or company');
    }

    const invoice = await models.Invoices.getInvoice({ _id });
    const updated = await models.Invoices.updateInvoice(_id, doc);

    const logData = {
      type: 'invoice',
      object: invoice,
      newData: { ...doc },
      updatedDocument: updated,
      extraParams: { models }
    };

    await updateLog(subdomain, user, logData);

    return updated;
  },

  /**
   * Removes invoices
   */

  loanInvoicesRemove: async (
    _root,
    { invoiceIds }: { invoiceIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    // TODO: contracts check
    const invoices = await models.Invoices.find({
      _id: { $in: invoiceIds }
    }).lean();

    await models.Invoices.removeInvoices(invoiceIds);

    for (const invoice of invoices) {
      const logData = {
        type: 'invoice',
        object: invoice,
        extraParams: { models }
      };
      await deleteLog(subdomain, user, logData);
    }

    return invoiceIds;
  }
};

checkPermission(invoiceMutations, 'loanInvoicesAdd', 'manageInvoices');
checkPermission(invoiceMutations, 'loanInvoicesEdit', 'manageInvoices');
checkPermission(invoiceMutations, 'loanInvoicesRemove', 'manageInvoices');

export default invoiceMutations;
