import { getSubdomain } from '@erxes/api-utils/src/core';
import { Router } from 'express';
import { debugInfo } from '@erxes/api-utils/src/debuggers';

import { generateModels } from './connectionResolver';
import redisUtils from './redisUtils';

const router = Router();

router.post('/checkInvoice', async (req, res) => {
  const { invoiceId } = req.body;

  const status = await redisUtils.getInvoiceStatus(invoiceId);

  if (status === 'paid') {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const invoice = await models.Invoices.getInvoice({ _id: invoiceId });

    redisUtils.removeInvoice(invoiceId);

    res.clearCookie(`paymentData_${invoice.contentTypeId}`);
  }

  return res.json({ status });
});

router.get('/gateway', async (req, res) => {
  const { params } = req.query;

  const data = JSON.parse(
    Buffer.from(params as string, 'base64').toString('ascii')
  );

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const filter: any = {};

  if (data.paymentIds) {
    filter._id = { $in: data.paymentIds };
  }

  const payments = await models.Payments.find(filter)
    .sort({
      type: 1
    })
    .lean();

  let invoice = await models.Invoices.findOne({ _id: data._id }).lean();

  const prefix = subdomain === 'localhost' ? '' : `/gateway`;
  const domain = process.env.DOMAIN || 'http://localhost:3000';

  debugInfo(
    `in gateway path-: subdomain: ${subdomain}, prefix: ${prefix}, domain: ${domain}`
  );

  if (invoice && invoice.status === 'paid') {
    return res.render('index', {
      title: 'Payment gateway',
      payments: payments,
      invoiceData: data,
      invoice,
      prefix,
      domain
    });
  }

  res.render('index', {
    title: 'Payment gateway',
    payments,
    invoiceData: data,
    domain,
    prefix: subdomain === 'localhost' ? '' : `/gateway`
  });
});

router.post('/gateway', async (req, res) => {
  const { params } = req.query;

  const data = JSON.parse(
    Buffer.from(params as string, 'base64').toString('ascii')
  );

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const prefix = subdomain === 'localhost' ? '' : `/gateway`;
  const domain = process.env.DOMAIN || 'http://localhost:3000';

  const filter: any = {};

  if (data.paymentIds) {
    filter._id = { $in: data.paymentIds };
  }

  const payments = await models.Payments.find(filter)
    .sort({
      type: 1
    })
    .lean();

  const selectedPaymentId = req.body.selectedPaymentId;

  const paymentsModified = payments.map(p => {
    if (p._id === selectedPaymentId) {
      return {
        ...p,
        selected: true
      };
    }

    return p;
  });

  let invoice = await models.Invoices.findOne({ _id: data._id });

  if (invoice && invoice.status === 'paid') {
    return res.render('index', {
      title: 'Payment gateway',
      payments: paymentsModified,
      invoiceData: data,
      invoice,
      prefix,
      domain
    });
  }

  if (
    invoice &&
    invoice.status !== 'paid' &&
    invoice.selectedPaymentId !== selectedPaymentId
  ) {
    await models.Invoices.updateInvoice(invoice._id, { selectedPaymentId });

    invoice = await models.Invoices.findOne({ _id: data._id });
  }

  if (!invoice) {
    invoice = await models.Invoices.createInvoice({
      ...data,
      selectedPaymentId
    });
  }

  try {
    redisUtils.updateInvoiceStatus(invoice._id, 'pending');

    res.render('index', {
      title: 'Payment gateway',
      payments: paymentsModified,
      invoiceData: data,
      invoice,
      prefix,
      domain
    });
  } catch (e) {
    res.render('index', {
      title: 'Payment gateway',
      payments: paymentsModified,
      invoiceData: data,
      error: e.message,
      prefix,
      domain
    });
  }
});

export default router;
