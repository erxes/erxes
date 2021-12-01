export default {
  routes: [
    {
      method: "GET",
      path: "/payments",
      handler: async ({ models, req }) => {
        const url = req.originalUrl as string;     
        console.log(url);
        const invoiceId = url.split('&')[0].split('=')[1];
        const paymentId = url.split('&')[1].split('=')[1];

        console.log("CALLBACK RESPONSE");
        console.log("InvoiceId", invoiceId , paymentId);        

        await models.QpayInvoice.updateOne({senderInvoiceNo: invoiceId} , 
          {$set : {paymentDate: new Date() , qpayPaymentId: paymentId, status: 'payed'}});
      },
    },
  ],
};
