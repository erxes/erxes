import { Db, MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'erxes';
let db: Db;

export let Checklists: any;
export let ChecklistItems: any;
export let Notifications: any;
export let Fields: any;
export let FormSubmissions: any;
export let FieldsGroups: any;
export let Segments: any;
export let Users: any;
export let InternalNotes: any;
export let Conformities: any;
export let Products: any;
export let Forms: any;

export default async function connect() {
  await client.connect();
  db = client.db(dbName);

  Checklists = await db.collection('checklists');
  ChecklistItems = await db.collection('checklist_items');
  Notifications = await db.collection('notifications');
  FormSubmissions = await db.collection('form_submissions');
  Fields = await db.collection('form_fields');
  FieldsGroups = await db.collection('form_field_groups');
  Segments = await db.collection('segments');
  Users = await db.collection('users');
  InternalNotes = await db.collection('internal_notes');
  Conformities = await db.collection('conformities');
  Products = await db.collection('products');
  Forms = await db.collection('forms');
}

export async function disconnect() {
  try {
    await client.close();
    console.log(`DB: Connection closed api db`);
  } catch (e) {
    console.error(e);
  }
}
