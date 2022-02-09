import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'erxes';
let db;

export let Brands;
export let Customers;
export let Tags;
export let Users;
export let Conformities;
export let Segments;
export let Fields;

const main = async () => {
  // Use connect method to connect to the server
  await client.connect();

  console.log('Connected successfully to server');

  db = client.db(dbName);

  Brands = await db.collection('brands');
  Customers = await db.collection('customers');
  Tags = await db.collection('tags');
  Users = await db.collection('users');
  Conformities = await db.collection('conformities');
  Segments = await db.collection('segments');
  Fields = await db.collection('form_fields');

  return 'done.';
}

export default main;