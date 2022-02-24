import { Db, MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const { API_MONGO_URL } = process.env;

if (!API_MONGO_URL) {
  throw new Error(`Environment variable API_MONGO_URL not set.`);
}

const client = new MongoClient(API_MONGO_URL);

let db: Db;

export async function connect() {
  await client.connect();

  console.log(`DB: Connected to ${API_MONGO_URL}`);

  db = client.db();

  return 'done';
}

export async function disconnect() {
  try {
    await client.close();
    console.log(`DB: Connection closed ${API_MONGO_URL}`);
  } catch (e) {
    console.error(e);
  }
}
