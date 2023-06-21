import { gatherDescriptions } from '../../../utils';
import {
  checkPermission,
  putCreateLog,
  putDeleteLog,
  putUpdateLog
} from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import messageBroker from '../../../messageBroker';
import {
  IInvoice,
  IInvoiceDocument
} from '../../../models/definitions/invoices';

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

    const descriptions = gatherDescriptions(logData);

    await putCreateLog(
      subdomain,
      messageBroker(),
      { ...descriptions, ...logData },
      user
    );

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

    const descriptions = gatherDescriptions(logData);

    await putUpdateLog(
      subdomain,
      messageBroker(),
      { ...descriptions, ...logData },
      user
    );

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
      const descriptions = gatherDescriptions(logData);
      await putDeleteLog(
        subdomain,
        messageBroker(),
        { ...logData, ...descriptions },
        user
      );
    }

    return invoiceIds;
  }
};

checkPermission(invoiceMutations, 'loanInvoicesAdd', 'manageInvoices');
checkPermission(invoiceMutations, 'loanInvoicesEdit', 'manageInvoices');
checkPermission(invoiceMutations, 'loanInvoicesRemove', 'manageInvoices');

export default invoiceMutations;
