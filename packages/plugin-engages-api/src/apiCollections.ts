import { Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

export let Users;
export let Conversations;
export let Channels;
export let Integrations;
export let Customers;
export let ConversationMessages;
export let Fields;
export let Segments;
export let Conformities;
export let Tags;
export let Pipelines;

export async function connect() {
  await client.connect();
  console.log(`DB: Connected to ${MONGO_URL}`);
  db = client.db();
  Users = db.collection('users');
  Conversations = db.collection('conversations');
  Channels = db.collection('channels');
  Integrations = db.collection('integrations');
  Customers = db.collection('customers');
  ConversationMessages = db.collection('conversation_messages');
  Fields = db.collection('fields');
  Segments = db.collection('segments');
  Conformities = db.collection('conformities');
  Tags = db.collection('tags');
  Pipelines = db.collection('pipelines');
}

export async function disconnect() {
  try {
    await client.close();
    console.log(`DB: Connection closed ${MONGO_URL}`);
  } catch (e) {
    console.error(e);
  }
}
