import redis from './redis';

const updateInvoiceStatus = async (invoiceId, status) => {
  const response = await redis.get('invoiceStatuses');
  const invoices = JSON.parse(response || '{}');

  invoices[invoiceId] = { status, updatedAt: new Date() };

  await redis.set('invoiceStatuses', JSON.stringify(invoices));
};

const getInvoiceStatus = async invoiceId => {
  const response = await redis.get('invoiceStatuses');
  const invoices = JSON.parse(response || '{}');

  const now = new Date();

  const pendingInvoices = Object.keys(invoices).filter(
    key => invoices[key].status !== 'paid'
  );

  if (pendingInvoices.length > 0) {
    for (const _id of pendingInvoices) {
      const updatedAt = new Date(invoices[_id].updatedAt);

      let diff = (now.getTime() - updatedAt.getTime()) / 1000;
      diff /= 60 * 60;
      const hours = Math.abs(Math.round(diff));

      if (hours > 24) {
        delete invoices[_id];
      }
    }
  }

  return invoices[invoiceId] ? invoices[invoiceId].status : 'paid';
};

const removeInvoice = async invoiceId => {
  const response = await redis.get('invoiceStatuses');
  const invoices = JSON.parse(response || '{}');

  delete invoices[invoiceId];

  await redis.set('invoiceStatuses', JSON.stringify(invoices));
};

const removeInvoices = async invoiceIds => {
  const response = await redis.get('invoiceStatuses');
  const invoices = JSON.parse(response || '{}');

  for (const _id of invoiceIds) {
    delete invoices[_id];
  }

  await redis.set('invoiceStatuses', JSON.stringify(invoices));
};

export default {
  updateInvoiceStatus,
  getInvoiceStatus,
  removeInvoice,
  removeInvoices
};
