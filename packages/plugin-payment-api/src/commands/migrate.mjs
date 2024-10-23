import mongoDb from 'mongodb';

const MongoClient = mongoDb.MongoClient;

const MONGO_URL = process.argv[2] || 'mongodb://localhost:27017/erxes';

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

console.log('Connected to ', MONGO_URL);

let db;

let Payments;
let Invoices;
let Transactions;

const command = async () => {
  await client.connect();
  db = client.db();

  Payments = db.collection('payments');
  Invoices = db.collection('invoices');
  Transactions = db.collection('payment_transactions');

  try {
    await Payments.rename('payment_methods');
  } catch (e) {
    console.error('Error: ', e);
  }

  try {
    await Invoices.rename('payment_invoices');
    Invoices = db.collection('payment_invoices');
  } catch (e) {
    console.error('Error: ', e);
  }

  const invoices = await Invoices.find().toArray();

  for (const invoice of invoices) {
    if (
      ['pending', 'paid'].includes(invoice.status) &&
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

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
