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

  Checklists = db.collection('checklists');
  ChecklistItems = db.collection('checklist_items');
  Notifications = db.collection('notifications');
  FormSubmissions = db.collection('form_submissions');
  Fields = db.collection('fields');
  FieldsGroups = db.collection('field_groups');
  Segments = db.collection('segments');
  Users = db.collection('users');
  InternalNotes = db.collection('internal_notes');
  Conformities = db.collection('conformities');
  Products = db.collection('products');
  Forms = db.collection('forms');
}

export async function disconnect() {
  try {
    await client.close();
    console.log(`DB: Connection closed api db`);
  } catch (e) {
    console.error(e);
  }
}
