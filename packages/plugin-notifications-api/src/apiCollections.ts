import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'erxes';
let db;

export let Users;

const main = async () => {
  // Use connect method to connect to the server
  await client.connect();

  db = client.db(dbName);

  Users = await db.collection('users');

  return 'done.';
};

export default main;
