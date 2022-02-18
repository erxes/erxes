import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'erxes';
let db;

export let Users;
export let Brands;
export let Channels;
export let Integrations;
export let Products;
export let Tags;
export let Deals;
export let Tasks;
export let Tickets;
export let GrowthHacks;
export let Stages;
export let Companies;
export let Customers;
export let Checklists;
export let ChecklistItems;
export let Conformities;
export let Conversations;
export let EmailDeliveries;
export let InternalNotes;

const main = async () => {
  // Use connect method to connect to the server
  await client.connect();

  db = client.db(dbName);

  Users = await db.collection('users');
  Brands = await db.collection('brands');
  Channels = await db.collection('channels');
  Integrations = await db.collection('integrations');
  Products = await db.collection('products');
  Tags = await db.collection('tags');
  Deals = await db.collection('deals');
  Tasks = await db.collection('tasks');
  Tickets = await db.collection('tickets');
  GrowthHacks = await db.collection('growthHacks');
  Stages = await db.collection('stages');
  Companies = await db.collection('companies');
  Customers = await db.collection('customers');
  Checklists = await db.collection('checklists');
  ChecklistItems = await db.collection('checklist_items');
  Conformities = await db.collection('conformities');
  Conversations = await db.collection('conversations');
  EmailDeliveries = await db.collection('email_deliveries');
  InternalNotes = await db.collection('internal_notes');

  return 'done.';
};

export default main;
