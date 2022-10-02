import { Model } from 'mongoose';

import { PAYMENT_TYPES } from '../../constants';
import { IModels } from '../connectionResolver';
import * as qpayUtils from '../api/qPay/utils';
import {
  IInvoice,
  IInvoiceDocument,
  invoiceSchema
} from './definitions/invoices';

export interface IInvoiceModel extends Model<IInvoiceDocument> {
  getInvoice(doc: any): IInvoiceDocument;
  createInvoice(doc: IInvoice): Promise<IInvoiceDocument>;

  //   InvoiceCreate(doc: any): IInvoiceDocument;
  //   InvoiceUpdate(invoice: any, qrText: any): IInvoiceDocument;
  //   InvoiceStatusUpdate(
  //     invoice: any,
  //     status: any
  //   ): IInvoiceDocument;
  //   checkInvoice(data: any): any;
  //   createInvoice(data: any, config: any): any;
}

export const loadInvoiceClass = (models: IModels) => {
  class Invoices {
    public static async getInvoice(doc: any) {
      const invoice = await models.Invoices.findOne(doc);

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return invoice;
    }

    public static async createInvoice(doc: IInvoice) {
      if (!doc.amount && doc.amount === 0) {
        throw new Error('Amount is required');
      }

      if (!doc.paymentConfigId) {
        throw new Error('Payment config id is required');
      }

      const paymentConfig = await models.PaymentConfigs.getPaymentConfig(
        doc.paymentConfigId
      );

      const invoice = await models.Invoices.create(doc);

      try {
        switch (paymentConfig.type) {
          case PAYMENT_TYPES.QPAY:
            // create qpay invoice
            invoice.apiResponse = await qpayUtils.createInvoice(
              invoice,
              paymentConfig
            );
            break;
          case PAYMENT_TYPES.SOCIAL_PAY:
            // create socialpay invoice
            break;
          default:
            break;
        }

        await invoice.save();

        return invoice;
      } catch (e) {
        // remove invoice if error
        await models.Invoices.deleteOne({ _id: invoice._id });

        throw new Error(e.message);
      }
    }
  }
  invoiceSchema.loadClass(Invoices);
  return invoiceSchema;
};
