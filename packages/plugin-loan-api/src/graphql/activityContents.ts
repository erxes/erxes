const loanActivityContents = [
  /**
   * Invoices / Transaction
   */
  {
    contentType: 'contract',
    activityType: 'plugin_invoices',
    handler: async (_root, doc, { models }) => {
      const invoices = await models.LoanInvoices.find({
        contractId: doc.contentId
      }).sort({ payDate: 1 });

      // top | last item
      invoices.push({
        status: 'empty',
        _doc: {
          status: 'empty',
          contractId: doc.contentId,
          createdAt: new Date()
        }
      });

      return invoices;
    },
    collectItems: async (activities, items) => {
      for (const item of items) {
        activities.push({
          ...item._doc,
          contentType: 'invoices',
          content: { ...item._doc }
        });
      }
    }
  }
];

export default loanActivityContents;
