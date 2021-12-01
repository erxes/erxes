
import { qpayInvoiceSchema,socialPayInvoiceSchema } from './definitions'

class QpayInvoice {
  public static async getQpayInvoice(models, _id: string) {
    const invoice = await models.QpayInvoice.findOne({ _id });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return invoice;
  };

  public static async qpayInvoiceCreate(models, doc) {

    const invoice = await models.QpayInvoice.findOne({senderInvoiceNo: doc.senderInvoiceNo});    
    
    if (invoice) {
      throw new Error('senderInvoiceNo duplicated');
    }

    return await models.QpayInvoice.create({
      ...doc
    });
    
  };

  public static async qpayInvoiceUpdate(models, invoice, invoiceData) {            
    const qpayInvoiceId = invoiceData.invoice_id;    
    const qrText = invoiceData.qr_text;
    await models.QpayInvoice.updateOne({_id: invoice._id} , {$set : { qpayInvoiceId, qrText }})    
  };
}
class SocialPayInvoice {
  public static async getSocialPayInvoice(models, invoiceNo: string) {
    const invoice = await models.SocialPayInvoice.findOne({ invoiceNo });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return invoice;
  };

  public static async socialPayInvoiceCreate(models, doc) {    
    const invoice = await models.SocialPayInvoice.create({
      ...doc
    });

    if (!invoice) {
      throw new Error('Invoice not logged on collection');
    }

    return invoice;
  };

  public static async socialPayInvoiceUpdate(models, invoice, qrText) {     
    
    console.log("invoiceQrData");      
    console.log(qrText);
    
    await models.SocialPayInvoice.updateOne({_id: invoice._id} , {$set : { qrText }});    
  };

  public static async socialPayInvoiceStatusUpdate(models, invoice, status) {     
    
    console.log("status");      
    console.log(status);
    
    await models.SocialPayInvoice.updateOne({_id: invoice._id} , {$set : { status }});    
  };
}

export default [
  {
    name: 'QpayInvoice',
    schema: qpayInvoiceSchema,
    klass: QpayInvoice
  },
  {
    name: 'SocialPayInvoice',
    schema: socialPayInvoiceSchema,
    klass: SocialPayInvoice
  }
];
