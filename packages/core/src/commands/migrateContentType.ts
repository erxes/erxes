import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Segments: Collection<any>;
let Fields: Collection<any>;
let FieldGroups: Collection<any>;
let Tags: Collection<any>;
let InternalNotes: Collection<any>;

const switchContentType = contentType => {
  let changedContentType = contentType;

  switch (contentType) {
    case 'deal':
      changedContentType = `cards:${contentType}`;
      break;
    case 'ticket':
      changedContentType = `cards:${contentType}`;
      break;
    case 'task':
      changedContentType = `cards:${contentType}`;
      break;
    case 'growthHack':
      changedContentType = `cards:${contentType}`;
      break;
    case 'customer':
      changedContentType = `contacts:${contentType}`;
      break;
    case 'company':
      changedContentType = `contacts:${contentType}`;
      break;
    case 'lead':
      changedContentType = `contacts:${contentType}`;
      break;
    case 'form_submission':
      changedContentType = `form_submission:${contentType}`;
      break;
  }

  return changedContentType;
};

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  Segments = db.collection('segments');
  Fields = db.collection('fields');
  FieldGroups = db.collection('fields_groups');
  Tags = db.collection('tags');
  InternalNotes = db.collection('internal_notes');

  await Segments.find({}).forEach(doc => {
    const contentType = switchContentType(doc.contentType);

    Segments.updateOne({ _id: doc._id }, { $set: { contentType } });
  });

  await FieldGroups.find({}).forEach(doc => {
    const contentType = switchContentType(doc.contentType);

    FieldGroups.updateOne({ _id: doc._id }, { $set: { contentType } });
  });

  await Fields.find({}).forEach(doc => {
    const contentType = switchContentType(doc.contentType);

    Fields.updateOne({ _id: doc._id }, { $set: { contentType } });
  });

  await Tags.find({}).forEach(doc => {
    const contentType = switchContentType(doc.contentType);

    Tags.updateOne({ _id: doc._id }, { $set: { contentType } });
  });

  await InternalNotes.find({}).forEach(doc => {
    const contentType = switchContentType(doc.contentType);

    InternalNotes.updateOne({ _id: doc._id }, { $set: { contentType } });
  });

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
