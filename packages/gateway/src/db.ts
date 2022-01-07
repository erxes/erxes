import * as dotenv from 'dotenv';
dotenv.config();

import { Collection, Db, MongoClient } from "mongodb";

const { MONGO_URL } = process.env;

if(!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

export let Users: Collection<any>;
export let Conversations: Collection<any>;
export let Channels: Collection<any>;
export let Integrations: Collection<any>;

export async function connect() {
  await client.connect();
  console.log(`DB: Connected to ${MONGO_URL}`)
  db = client.db();
  Users = db.collection('users');
  Conversations = db.collection('conversations');
  Channels = db.collection('channels');
  Integrations = db.collection('integrations');
}

export async function disconnect() {
  try {
    await client.close();
    console.log(`DB: Connection closed ${MONGO_URL}`)
  } catch (e) {
    console.error(e);
  }
}