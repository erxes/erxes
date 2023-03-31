import * as dotenv from 'dotenv';
import mongoDb from 'mongodb';

dotenv.config();

const MongoClient = mongoDb.MongoClient;

const MONGO_URL = process.argv[2];

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

console.log('Connected to ', MONGO_URL);

let db;

let Invoices;

const command = async () => {
  await client.connect();
  db = client.db();

  Invoices = db.collection('invoices');

  const invoices = await Invoices.find({}).toArray();

  for (const invoice of invoices) {
    if (invoice.customerId) {
      await Invoices.updateOne(
        { _id: invoice._id },
        { $set: { customerType: 'customer' } }
      );
    }

    if (invoice.companyId) {
      await Invoices.updateOne(
        { _id: invoice._id },
        { $set: { customerType: 'company' } }
      );
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
