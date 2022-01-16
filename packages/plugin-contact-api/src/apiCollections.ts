import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'erxes';
let db;

export let Configs;
export let Brands;
export let Customers;
export let Companies;
export let Tags;
export let Users;
export let Segments;
export let Fields;
export let FieldsGroups;
export let Products;
export let ProductCategories;
export let Forms;
export let EmailDeliveries;
export let Conformities;
export let InternalNotes;
export let FormSubmissions;
export let Integrations;

const main = async () => {
  // Use connect method to connect to the server
  await client.connect();

  console.log('Connected successfully to server');

  db = client.db(dbName);

  Configs = await db.collection('configs');
  Brands = await db.collection('brands');
  Customers = await db.collection('customers');
  Companies = await db.collection('companies');
  Tags = await db.collection('tags');
  Users = await db.collection('users');
  Segments = await db.collection('segments');
  Fields = await db.collection('form_fields');
  FieldsGroups = await db.collection('form_field_groups');
  Products = await db.collection('products');
  ProductCategories = await db.collection('product_categories');
  Forms = await db.collection('forms');
  EmailDeliveries = await db.collection('email_deliveries');
  Conformities = await db.collection('conformities');
  InternalNotes = await db.collection('internal_notes');
  FormSubmissions = await db.collection('form_submissions');
  Integrations = await db.collection('integrations');

  return 'done.';
};

export default main;
