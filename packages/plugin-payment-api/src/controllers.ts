import { PAYMENT_TYPES } from './../constants';
import { getSubdomain } from '@erxes/api-utils/src/core';
import * as dotenv from 'dotenv';
import { Router } from 'express';
import { generateModels } from './connectionResolver';
import * as QRCode from 'qrcode';

dotenv.config();

const router = Router();

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
    invoice = await models.Invoices.createInvoice({
      ...data,
      token: params,
      paymentConfigId
    });

    const selectedPayment = payments.find(p => p.selected);

    if (selectedPayment.type === PAYMENT_TYPES.SOCIAL_PAY && !invoice.phone) {
      invoice.apiResponse.socialPayQrCode = await QRCode.toDataURL(
        invoice.apiResponse.text
      );
    }

    res.render('index', {
      title: 'Payment gateway',
      payments,
      invoiceData: data,
      invoice
    });
  } catch (e) {
    console.log(e.message);
    res.render('index', {
      title: 'Payment gateway',
      payments,
      invoiceData: data,
      error: e.message
    });
  }
});

export default router;
