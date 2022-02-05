import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost/erxes';
const client = new MongoClient(url);

const dbName = 'erxes';
let db;

export let Configs;
export let Brands;
export let Tags;
export let Users;
export let Segments;
export let Fields;
export let FieldsGroups;
export let Forms;
export let EmailDeliveries;
export let InternalNotes;
export let FormSubmissions;
export let Integrations;
export let Channels;
export let MessengerApps;

const main = async () => {
  // Use connect method to connect to the server
  await client.connect();

  console.log('Connected successfully to server');

  db = client.db(dbName);

  Configs = await db.collection('configs');
  Brands = await db.collection('brands');
  Tags = await db.collection('tags');
  Users = await db.collection('users');
  Segments = await db.collection('segments');
  Fields = await db.collection('form_fields');
  FieldsGroups = await db.collection('form_field_groups');
  Forms = await db.collection('forms');
  EmailDeliveries = await db.collection('email_deliveries');
  InternalNotes = await db.collection('internal_notes');
  FormSubmissions = await db.collection('form_submissions');
  Integrations = await db.collection('integrations');
  Channels = await db.collection('channels');
  MessengerApps = await db.collection('messenger_apps');

  return 'done.';
};

export default main;
