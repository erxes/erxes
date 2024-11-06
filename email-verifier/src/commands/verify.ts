import * as dotenv from 'dotenv';
import { Collection, Db, MongoClient } from 'mongodb';
import fetch = require('node-fetch');
import redis from '../redis';


dotenv.config();

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

export const setArray = async (key, array) => {
  const jsonArray = JSON.stringify(array);
  await redis.set(key, jsonArray);
};

export const getArray = async (key) => {
  const jsonArray = await redis.get(key);

  if (!jsonArray) {
    return [];
  }

  return JSON.parse(jsonArray);
};

export const bulkMailsso = async (emails: string[], hostname?: string) => {
  console.log('bulkMailsso', emails);
  const MAILS_SO_KEY = process.env.MAILS_SO_KEY;
  console.log('MAILS_SO_KEY', MAILS_SO_KEY);
  const body = { emails };
  const redisKey = 'erxes_email_verifier_list_ids';

  fetch('https://api.mails.so/v1/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-mails-api-key': MAILS_SO_KEY,
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then(async (result) => {
      const listIds = await getArray(redisKey);

      listIds.push({ listId: result.id, hostname });

      setArray(redisKey, listIds);
    })
    .catch((error) => console.error('Error:', error));
};

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

    let skip = 100000;

    while (skip < totalEmails) {
      const emailsBatch = await Emails.find({})
        .skip(skip)
        .limit(BATCH_SIZE)
        .toArray();

      if (emailsBatch.length === 0) {
        break; // No more documents to process
      }

      const emailsArray = emailsBatch.map((email) => email.email);

      // Send the batch to the third-party verification service
      await bulkMailsso(emailsArray);

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
