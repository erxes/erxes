import { Model, Schema } from 'mongoose';
import { CURRENCIES, PAYMENT_STATUS } from '~/constants';
import { IInvoiceDocument } from '~/modules/payment/@types/invoices';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const invoiceSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    invoiceNumber: { type: String },
    amount: { type: Number },
    currency: { type: String, enum: CURRENCIES, default: 'MNT' },
    phone: { type: String },
    email: { type: String },
    paymentIds: { type: [String] },
    redirectUri: { type: String },

    description: { type: String },
    status: { type: String, default: PAYMENT_STATUS.PENDING },
    customerType: { type: String },
    customerId: { type: String },
    contentType: { type: String },
    contentTypeId: { type: String },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    data: { type: Schema.Types.Mixed },
    apiResponse: { type: Schema.Types.Mixed },
    callback: { type: String },
    warningText: { type: String },
  }),
);

invoiceSchema.index({ invoiceNumber: 1 });

invoiceSchema.pre<IInvoiceDocument>('save', async function (next) {
  try {
    if (!this.invoiceNumber) {
      const currentDate = new Date();
      const year = currentDate.getFullYear().toString().slice(-2);
      const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
      const day = ('0' + currentDate.getDate()).slice(-2);
      const currentDateString = `${year}${month}${day}`;

      const lastInvoice = await (
        this.constructor as Model<IInvoiceDocument>
      ).findOne({}, {}, { sort: { createdAt: -1 } });

      if (!lastInvoice || !lastInvoice.invoiceNumber) {
        this.invoiceNumber = `INV-${currentDateString}-0001`;
      } else {
        const lastInvoiceDate = lastInvoice.invoiceNumber.split('-')[1];
        const lastValue = Number(
          lastInvoice.invoiceNumber.split('-').pop() || '0000',
        );

        if (lastInvoiceDate === currentDateString) {
          const newIncrementalValue = lastValue + 1;
          const formattedIncrementalValue = (
            '0000' + newIncrementalValue
          ).slice(-4);
          this.invoiceNumber = `INV-${currentDateString}-${formattedIncrementalValue}`;
        } else {
          this.invoiceNumber = `INV-${currentDateString}-0001`;
        }
      }
    }
    next();
  } catch (e) {
    next(e);
  }
});
