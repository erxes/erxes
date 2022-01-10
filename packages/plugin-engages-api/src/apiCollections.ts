import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'erxes';
let db;

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  db = client.db(dbName);
  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());

export const _DB = () => {
  return db;
};

export const _ConversationMessages = async () => {
  const collection = await db.collection('conversation_messages');
  return collection;
};

export const _Conversations = async () => {
  const collection = await db.collection('conversations');
  return collection;
};

export const _Customers = async () => {
  const collection = await db.collection('customers');
  return collection;
};

export const _Tags = async () => {
  const collection = await db.collection('tags');
  return collection;
};

export const _Users = async () => {
  const collection = await db.collection('users');
  return collection;
};

export const _Integrations = async () => {
  const collection = await db.collection('integrations');
  return collection;
};

export const _Conformities = async () => {
  const collection = await db.collection('conformities');
  return collection;
};

export const _Segments = async () => {
  const collection = await db.collection('segments');
  return collection;
};

export const _Fields = async () => {
  const collection = await db.collection('fields');
  return collection;
};

export const _Pipelines = async () => {
  const collection = await db.collection('pipelines');
  return collection;
};
