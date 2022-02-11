import { Db, MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'erxes';
let db: Db;

export let Forms: any;
export let FormSubmissions: any;
export let Fields: any;
export let FieldsGroups: any;
export let Segments: any;
export let Users: any;
export let InternalNotes: any;

export default async function connect() {
  await client.connect();
  db = client.db(dbName);

  Fields = await db.collection('form_fields');
  Forms = await db.collection('forms');
  FormSubmissions = await db.collection('form_submissions');
  FieldsGroups = await db.collection('form_field_groups');
  Segments = await db.collection('segments');
  Users = await db.collection('users');
  InternalNotes = await db.collection('internal_notes');
}

export async function disconnect() {
  try {
    await client.close();
    console.log(`DB: Connection closed api db`);
  } catch (e) {
    console.error(e);
  }
}