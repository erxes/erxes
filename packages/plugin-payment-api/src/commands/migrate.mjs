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

const command = async () => {
  await client.connect();
  db = client.db();

  Payments = db.collection('payments');
  Invoices = db.collection('invoices');

  try {
    await Payments.rename('payment_methods');
  } catch (e) {
    console.log('Error: ', e);
  }

  try {
    await Invoices.rename('payment_invoices');
  } catch (e) {
    console.log('Error: ', e);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
