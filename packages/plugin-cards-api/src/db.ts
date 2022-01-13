import * as dotenv from 'dotenv';
dotenv.config();

import { Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

export let _Checklists: any;
export let _Notifications: any;
export let _Fields: any;
export let _FieldsGroups: any;
export let _PipelineLabels: any;
export let _Segments: any;
export let _Users: any;

export async function connect() {
  await client.connect();
  console.log(`DB: Connected to ${MONGO_URL}`);
  db = client.db();

  _Checklists = db.collection('checklists');
  _Notifications = db.collection('notifications');
  _Fields = db.collection('fields');
  _FieldsGroups = db.collection('field_groups');
  _PipelineLabels = db.collection('pipeline_labels');
  _Segments = db.collection('segments');
  _Users = db.collection('users');
}

export async function disconnect() {
  try {
    await client.close();
    console.log(`DB: Connection closed ${MONGO_URL}`);
  } catch (e) {
    console.error(e);
  }
}
