export const qpayInvoiceSchema = {
  _id: { pkey: true },
  senderInvoiceNo: { type: String, optional: true, unique: true },
  amount: { type: String, optional: true, label: 'amount' },  
  qpayInvoiceId: { type: String, optional: true, label: 'new invoiceId' },
  qrText: { type: String, optional: true, label: 'new qrText for qpay Invoice' },
  qpayPaymentId: { type: String, optional: true, label: 'new paymentId' },
  status: { type: String, default: "open", label: 'qr text' },
  paymentDate: {
    type: Date,    
    label: 'Updated Date for Qpay payment'
  },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created Date for new invoice'
  }
};

export const socialPayInvoiceSchema = {
  _id: { pkey: true },
  invoiceNo: { type: String, optional: true, unique: true },
  amount: { type: String, optional: true, label: 'amount' },
  phone: { type: String, optional: true, label: 'phone' },
  qrText: { type: String, optional: true, label: 'qr text' },
  status: { type: String, default: "open", label: 'qr text' },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created Date for new invoice'
  }
}
