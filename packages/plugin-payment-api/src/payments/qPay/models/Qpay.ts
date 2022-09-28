import { Model } from 'mongoose';

import {
  createQpayInvoice,
  getQpayInvoice,
  makeInvoiceNo,
  qpayToken
} from '../../../utils';
import { IModels } from '../../../connectionResolver';
import {
  IQpayInvoiceDocument,
  qpayInvoiceSchema
} from './definitions/qpayInvoices';

export interface IQpayInvoiceModel extends Model<IQpayInvoiceDocument> {
  getQpayInvoice(_id: string): IQpayInvoiceDocument;
  qpayInvoiceCreate(doc: any): IQpayInvoiceDocument;
  qpayInvoiceUpdate(invoice: any, invoiceData: any): IQpayInvoiceDocument;
  checkInvoice(data: any): any;
  createInvoice(data: any): any;
}

export const loadQpayInvoiceClass = (models: IModels) => {
  class QpayInvoices {
    public static async getQpayInvoice(_id: string) {
      const invoice = await models.QpayInvoices.findOne({ _id });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return invoice;
    }

    public static async qpayInvoiceCreate(doc) {
      const invoice = await models.QpayInvoices.findOne({
        senderInvoiceNo: doc.senderInvoiceNo
      });

      if (invoice) {
        throw new Error('senderInvoiceNo duplicated');
      }

      return await models.QpayInvoices.create({
        ...doc
      });
    }

    public static async checkInvoice(data) {
      const { config, invoiceId } = data;
      const token = await qpayToken(config);
      const invoice = await models.QpayInvoices.findOne({
        qpayInvoiceId: invoiceId
      });

      const detail: any = await getQpayInvoice(invoiceId, token);

      if (!invoice || detail.error || detail.invoice_status !== 'CLOSED') {
        return {
          status: 'failed',
          data: { ...detail }
        };
      }

      const payments = detail.payments;

      payments.map(async e => {
        const paymentId = e.payment_id;

        await models.QpayInvoices.updateOne(
          { qpayInvoiceId: invoiceId },
          {
            $set: {
              paymentDate: new Date(),
              qpayPaymentId: paymentId,
              status: 'paid'
            }
          }
        );
      });

      return {
        status: 'success',
        data: { ...detail, invoice_status: 'paid' }
      };
    }

    public static async createInvoice(data) {
      const {
        config,
        description,
        amount,
        customerId,
        companyId,
        contentType,
        contentTypeId
      } = data;
      const { qpayInvoiceCode } = config;
      const invoice_receiver_code = 'terminal';
      const token = await qpayToken(config);
      const sender_invoice_no = await makeInvoiceNo(16);

      const invoiceDoc = {
        senderInvoiceNo: sender_invoice_no,
        amount,
        customerId,
        companyId,
        contentType,
        contentTypeId
      };

      const invoice = await models.QpayInvoices.qpayInvoiceCreate(invoiceDoc);

      const MAIN_API_DOMAIN =
        process.env.MAIN_API_DOMAIN || 'https://4d89-66-181-178-61.ap.ngrok.io';

      const varData = {
        invoice_code: qpayInvoiceCode,
        sender_invoice_no,
        invoice_receiver_code,
        invoice_description: description || 'test invoice',
        amount,
        callback_url: `${MAIN_API_DOMAIN}/pl:payment/callback?type=qpay&payment_id=${invoice._id}`
      };

      const response = await createQpayInvoice(varData, token);

      if (response.error) {
        await models.QpayInvoices.remove({ _id: invoice._id });
        throw new Error(response.error);
      }

      await models.QpayInvoices.qpayInvoiceUpdate(invoice, response);

      return {
        status: 'success',
        data: { _id: invoice._id, ...response }
      };
    }

    public static async qpayInvoiceUpdate(invoice, invoiceData) {
      const qpayInvoiceId = invoiceData.invoice_id;
      const qrText = invoiceData.qr_text;
      await models.QpayInvoices.updateOne(
        { _id: invoice._id },
        { $set: { qpayInvoiceId, qrText } }
      );
    }
  }
  qpayInvoiceSchema.loadClass(QpayInvoices);
  return qpayInvoiceSchema;
};
