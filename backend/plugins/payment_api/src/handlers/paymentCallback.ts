import { IInvoice } from '../modules/payment/@types/invoices';

// Extend IInvoice to include _id (since the database document has it)
interface IInvoiceDocument extends IInvoice {
  _id: string;
}

export const handlePaymentCallback = async (subdomain: string, invoice: IInvoiceDocument) => {
  const { contentType, contentTypeId, amount, _id } = invoice;

  if (!contentType || !contentTypeId) {
    return;
  }

  if (contentType === 'cards:transaction') {
    // Your actual update logic here
  }

  // Add more handlers as needed
};