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
export let Conformities;
export let Segments;
export let Fields;
export let Products;
export let ProductCategories;
export let Forms;

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
  Conformities = await db.collection('conformities');
  Segments = await db.collection('segments');
  Fields = await db.collection('form_fields');
  Products = await db.collection('products');
  ProductCategories = await db.collection('product_categories');
  Forms = await db.collection('forms');

  return 'done.';
}

export default main;