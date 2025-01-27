import * as dotenv from 'dotenv';
import mongoDb from 'mongodb';

dotenv.config();

const MongoClient = mongoDb.MongoClient;

const MONGO_URL =
  process.argv[2] || 'mongodb://localhost:27017/erxes?directConnection=true';

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

console.debug('Connected to ', MONGO_URL);

let db;

let Invoices;
let Payments;

const command = async () => {
  await client.connect();
  db = client.db();

  Invoices = db.collection('payment_invoices');
  Payments = db.collection('payment_methods');

  const invoices = await Invoices.find({}).toArray();

  for (const invoice of invoices) {
    await Invoices.updateOne(
      { _id: invoice._id },
      { $set: { currency: 'MNT' } }
    );
  }

  const payments = await Payments.find({}).toArray();

  for (const payment of payments) {
    await Payments.updateOne(
      { _id: payment._id },
      { $set: { acceptedCurrencies: ['MNT'] } }
    );
  }

  console.debug(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
