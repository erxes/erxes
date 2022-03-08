import { MongoClient } from 'mongodb';

const url = process.env.API_MONGO_URL || 'mongodb://localhost/erxes';
const client = new MongoClient(url);

const dbName = 'erxes';
let db;

export let Brands;
export let Users;
export let Fields;
export let FieldsGroups;
export let Forms;
export let EmailDeliveries;

const main = async () => {
  // Use connect method to connect to the server
  await client.connect();

  db = client.db(dbName);

  Brands = await db.collection('brands');
  Users = await db.collection('users');
  Fields = await db.collection('form_fields');
  FieldsGroups = await db.collection('form_field_groups');
  Forms = await db.collection('forms');
  EmailDeliveries = await db.collection('email_deliveries');

  return 'done.';
};

export default main;
