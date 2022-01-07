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

export async function connect() {
  await client.connect();
  console.log(`DB: Connected to ${MONGO_URL}`)
  db = client.db();
  Users = db.collection('users');
}

export async function disconnect() {
  try {
    await client.close();
    console.log(`DB: Connection closed ${MONGO_URL}`)
  } catch (e) {
    console.error(e);
  }
}