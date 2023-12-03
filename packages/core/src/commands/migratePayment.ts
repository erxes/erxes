import * as dotenv from 'dotenv';

dotenv.config();
import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let DealCollections: Collection<any>;
const command = async () => {
  await client.connect();
  db = client.db() as Db;
  DealCollections = db.collection('deals');

  const deals = await DealCollections.find({}).toArray();

  // tslint:disable-next-line:no-shadowed-variable
  for (const deal of deals) {
    const { _id, ...item } = deal;
    const paymentsData = item.paymentsData;

    // tslint:disable-next-line:prefer-const
    let updatedPaymentsData = { ...paymentsData }; // Create a copy of paymentsData

    // tslint:disable-next-line:forin
    for (const key in paymentsData) {
      updatedPaymentsData[key] = {
        ...paymentsData[key], // Copy the existing properties of
        title: key, // Add the title property with the key as its value
        type: key
      };
    }

    await DealCollections.updateOne(
      { _id },
      { $set: { paymentsData: updatedPaymentsData } }
    );
  }

  console.log(`Process finished at: ${new Date()}`);
  process.exit();
};

command();
