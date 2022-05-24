import { putCreateLog, putDeleteLog, putUpdateLog } from 'erxes-api-utils';
import { gatherDescriptions } from '../../../utils';
import { checkPermission } from '@erxes/api-utils/src';

const invoiceMutations = {
  invoicesAdd: async (
    _root,
    doc,
    { user, docModifier, models, checkPermission, messageBroker }
  ) => {
    await checkPermission('manageInvoices', user);

    if (!(doc.companyId || doc.customerId)) {
      throw new Error('must choose customer or company');
    }

    const invoice = models.Invoices.createInvoice(
      models,
      docModifier(doc),
      user
    );

    await putCreateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'invoice',
        newData: doc,
        object: invoice,
        extraParams: { models }
      },
      user
    );

    return invoice;
  },
  /**
   * Updates a invoice
   */

  invoicesEdit: async (
    _root,
    { _id, ...doc },
    { models, checkPermission, user, messageBroker }
  ) => {
    await checkPermission('manageInvoices', user);
    if (!(doc.companyId || doc.customerId)) {
      throw new Error('must choose customer or company');
    }

    const invoice = await models.Invoices.getInvoice(models, { _id });
    const updated = await models.Invoices.updateInvoice(models, _id, doc);

    await putUpdateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'invoice',
        object: invoice,
        newData: { ...doc },
        updatedDocument: updated,
        extraParams: { models }
      },
      user
    );

    return updated;
  },

  /**
   * Removes invoices
   */

  invoicesRemove: async (
    _root,
    { invoiceIds }: { invoiceIds: string[] },
    { models, checkPermission, user, messageBroker }
  ) => {
    await checkPermission('manageInvoices', user);
    // TODO: contracts check
    const invoices = await models.Invoices.find({
      _id: { $in: invoiceIds }
    }).lean();

    await models.Invoices.removeInvoices(models, invoiceIds);

    for (const invoice of invoices) {
      await putDeleteLog(
        messageBroker,
        gatherDescriptions,
        { type: 'invoice', object: invoice, extraParams: { models } },
        user
      );
    }

    return invoiceIds;
  }
};

checkPermission(invoiceMutations, 'invoicesAdd', 'manageInvoices');
checkPermission(invoiceMutations, 'invoicesEdit', 'manageInvoices');
checkPermission(invoiceMutations, 'invoicesRemove', 'manageInvoices');

export default invoiceMutations;
