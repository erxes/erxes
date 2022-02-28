import { MongoClient } from 'mongodb';

const url = process.env.API_MONGO_URL || '';
const client = new MongoClient(url);

const dbName = 'erxes';
let db;

export let Fields;

const main = async () => {
  // Use connect method to connect to the server
  await client.connect();

  console.log('Connected successfully to server');

  db = client.db(dbName);

  Fields = await db.collection('fields');

  return 'done.';
}

export default main;