import * as dotenv from 'dotenv';
dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

export let Users: Collection<any>;
export let Brands: Collection<any>;
export let Tags: Collection<any>;
export let Integrations: Collection<any>;
export let Stages: Collection<any>;
export let Boards: Collection<any>;
export let Pipelines: Collection<any>;

export async function connect() {
  await client.connect();
  console.log(`DB: Connected to ${MONGO_URL}`);
  db = client.db();
  Users = db.collection('users');
  Brands = db.collection('brands');
  Tags = db.collection('tags');
  Integrations = db.collection('integrations');
  Stages = db.collection('stages');
  Boards = db.collection('boards');
  Pipelines = db.collection('db.pipelines');
}

export async function disconnect() {
  try {
    await client.close();
    console.log(`DB: Connection closed ${MONGO_URL}`);
  } catch (e) {
    console.error(e);
  }
}
