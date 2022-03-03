import { MongoClient } from 'mongodb';

const url = process.env.API_MONGO_URL || 'mongodb://localhost/erxes';
const client = new MongoClient(url);

let db;

export let Configs;
export let Brands;
export let Users;
export let Segments;
export let Fields;
export let FieldsGroups;
export let Forms;
export let EmailDeliveries;
export let FormSubmissions;

const main = async () => {
  // Use connect method to connect to the server
  await client.connect();

  console.log('Connected successfully to server');

  db = client.db();

  Configs = await db.collection('configs');
  Brands = await db.collection('brands');
  Users = await db.collection('users');
  Segments = await db.collection('segments');
  Fields = await db.collection('form_fields');
  FieldsGroups = await db.collection('form_field_groups');
  Forms = await db.collection('forms');
  EmailDeliveries = await db.collection('email_deliveries');
  FormSubmissions = await db.collection('form_submissions');

  return 'done.';
};

export default main;
