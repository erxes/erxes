import * as dotenv from 'dotenv';
dotenv.config();

import { Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

export let Checklists: any;
export let ChecklistItems: any;
export let Notifications: any;
export let Fields: any;
export let FieldsGroups: any;
export let PipelineLabels: any;
export let Segments: any;
export let Users: any;
export let InternalNotes: any;
export let Conformities: any;
export let Products: any;

export async function connect() {
  await client.connect();
  console.log(`DB: Connected to ${MONGO_URL}`);
  db = client.db();

  Checklists = db.collection('checklists');
  ChecklistItems = db.collection('checklist_items');
  Notifications = db.collection('notifications');
  Fields = db.collection('fields');
  FieldsGroups = db.collection('field_groups');
  PipelineLabels = db.collection('pipeline_labels');
  Segments = db.collection('segments');
  Users = db.collection('users');
  InternalNotes = db.collection('internal_notes');
  Conformities = db.collection('conformities');
  Products = db.collection('products');
}

export async function disconnect() {
  try {
    await client.close();
    console.log(`DB: Connection closed ${MONGO_URL}`);
  } catch (e) {
    console.error(e);
  }
}
