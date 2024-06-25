import * as dotenv from 'dotenv';

dotenv.config();

import { MongoClient } from 'mongodb';

import { getOrganizations } from '@erxes/api-utils/src/saas/saas';

const { MONGO_URL = '' } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

let db;

const command = async () => {
  const organizations = await getOrganizations();

  for (const org of organizations) {
    try {
      console.log(MONGO_URL, org._id);
      const client = new MongoClient(
        MONGO_URL.replace('<organizationId>', org._id)
      );

      await client.connect();
      db = client.db();

      const Payments = db.collection('payments');
      let Invoices = db.collection('invoices');
      const Transactions = db.collection('payment_transactions');

      try {
        await Payments.rename('payment_methods');
      } catch (e) {
        console.log('Error: ', e);
      }

      try {
        await Invoices.rename('payment_invoices');
        Invoices = db.collection('payment_invoices');
      } catch (e) {
        console.log('Error: ', e);
      }

      const invoices = await Invoices.find().toArray();

      for (const invoice of invoices) {
        if (
          invoice.selectedPaymentId
        ) {
          // add transaction
          await Transactions.insertOne({
            _id: invoice.identifier,
            invoiceId: invoice._id,
            paymentId: invoice.selectedPaymentId,
            paymentKind: invoice.paymentKind,
            amount: invoice.amount,
            status: invoice.status,
            description: invoice.description,
            details: {
              phone: invoice.phone || '',
              email: invoice.email || '',
              couponAmount: invoice.couponAmount || '',
              couponCode: invoice.couponCode || '',
            },
            response: invoice.apiResponse,
          });
        }
      }

      console.log('migrated', org.subdomain);
    } catch (e) {
      console.error(e.message);
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
