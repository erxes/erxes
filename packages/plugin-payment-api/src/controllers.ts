import { getSubdomain } from '@erxes/api-utils/src/core';
import { Router } from 'express';
import * as QRCode from 'qrcode';

import { PAYMENT_KINDS } from './constants';
import { generateModels } from './connectionResolver';
import redisUtils from './redisUtils';

const router = Router();

router.post('/checkInvoice', async (req, res) => {
  const { invoiceId } = req.body;

  const status = await redisUtils.getInvoiceStatus(invoiceId);

  if (status === 'paid') {
    redisUtils.removeInvoice(invoiceId);
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

  if (data.paymentConfigIds) {
    filter._id = { $in: data.paymentConfigIds };
  }

  const paymentConfigs = await models.PaymentConfigs.find(filter).sort({
    type: 1
  });

  res.render('index', {
    title: 'Payment gateway',
    payments: paymentConfigs,
    invoiceData: data
  });
});

router.post('/gateway', async (req, res) => {
  const { params } = req.query;

  const data = JSON.parse(
    Buffer.from(params as string, 'base64').toString('ascii')
  );

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const filter: any = {};

  if (data.paymentConfigIds) {
    filter._id = { $in: data.paymentConfigIds };
  }

  const paymentConfigs = await models.PaymentConfigs.find(filter).sort({
    type: 1
  });

  const paymentConfigId = req.body.paymentConfigId;

  const payments = paymentConfigs.map(p => {
    if (p._id === paymentConfigId) {
      return {
        ...(p.toJSON() as any),
        selected: true
      };
    }

    return p.toJSON();
  });

  let invoice = await models.Invoices.findOne({ token: params });

  if (
    (invoice && invoice.status === 'paid') ||
    (invoice && invoice.paymentConfigId === paymentConfigId)
  ) {
    return res.render('index', {
      title: 'Payment gateway',
      payments: payments,
      invoiceData: data,
      invoice
    });
  }

  if (
    invoice &&
    invoice.status !== 'paid' &&
    invoice.paymentConfigId !== paymentConfigId
  ) {
    models.Invoices.cancelInvoice(invoice._id);
  }

  try {
    const selectedPayment = payments.find(p => p.selected);
    invoice = await models.Invoices.createInvoice({
      ...data,
      token: params,
      paymentConfigId,
      paymentKind: selectedPayment.kind
    });

    if (selectedPayment.kind === PAYMENT_KINDS.SOCIAL_PAY && !invoice.phone) {
      invoice.apiResponse.socialPayQrCode = await QRCode.toDataURL(
        invoice.apiResponse.text
      );
    }

    redisUtils.updateInvoiceStatus(invoice._id, 'pending');

    res.render('index', {
      title: 'Payment gateway',
      payments,
      invoiceData: data,
      invoice
    });
  } catch (e) {
    res.render('index', {
      title: 'Payment gateway',
      payments,
      invoiceData: data,
      error: e.message
    });
  }
});

export default router;
