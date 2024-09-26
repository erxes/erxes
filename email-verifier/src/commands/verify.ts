import * as dotenv from 'dotenv';
import { Collection, Db, MongoClient } from 'mongodb';
import { bulkMailsso } from '../utils';

dotenv.config();

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;
let Emails: Collection<any>;

const BATCH_SIZE = 50000;

const command = async () => {
  try {
    await client.connect();
    db = client.db() as Db;
    Emails = db.collection('emails');

    let totalEmails = await Emails.countDocuments();
    console.log(`Total emails to process: ${totalEmails}`);

    let skip = 0;

    while (skip < totalEmails) {
      const emailsBatch = await Emails.find({})
        .skip(skip)
        .limit(BATCH_SIZE)
        .toArray();

      if (emailsBatch.length === 0) {
        break; // No more documents to process
      }

      // Send the batch to the third-party verification service
      await bulkMailsso(emailsBatch);

      console.log(`Processed ${skip + emailsBatch.length} / ${totalEmails}`);

      // Increment the skip to process the next batch
      skip += emailsBatch.length;
    }

    console.log(`Process finished at: ${new Date()}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  } finally {
    await client.close();
    process.exit();
  }
};

command();
