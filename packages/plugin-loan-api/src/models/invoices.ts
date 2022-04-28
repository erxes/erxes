export class Invoice {
  /**
   *
   * Get Invoice
   */

  public static async getInvoice(models, selector: any) {
    const invoice = await models.LoanInvoices.findOne(selector);

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return invoice;
  }

  /**
   * Create a invoice
   */
  public static async createInvoice(models, doc) {
    doc.total = (doc.payment || 0) + (doc.interestEve || 0) + (doc.interestNonce || 0) + (doc.insurance || 0) + (doc.undue || 0) + (doc.debt || 0);
    return models.LoanInvoices.create(doc);
  }

  /**
   * Update Invoice
   */
  public static async updateInvoice(models, _id, doc) {
    await models.LoanInvoices.updateOne({ _id }, { $set: doc });

    return models.LoanInvoices.findOne({ _id });
  }

  /**
   * Remove Invoice
   */
  public static async removeInvoices(models, _ids) {
    return models.LoanInvoices.deleteMany({ _id: { $in: _ids } });
  }

}
