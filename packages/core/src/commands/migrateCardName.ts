import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

let { MONGO_URL } = process.env;
// let MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true';
// mongodb://localhost:27017/?readPreference=primary&directConnection=true&ssl=false&authSource=erxes
if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Fields: Collection<any>;
let FieldsGroup: Collection<any>;
function generateMongoId() {
  const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
  const objectId =
    timestamp +
    'xxxxxxxxxxxxxxxx'
      .replace(/[x]/g, function () {
        return ((Math.random() * 16) | 0).toString(16);
      })
      .toLowerCase();
  return objectId;
}
const command = async () => {
  await client.connect();
  db = client.db() as Db;

  FieldsGroup = db.collection('fields_groups');
  Fields = db.collection('form_fields');

  const groups = await FieldsGroup.find({
    name: 'Basic information',
    contentType: { $regex: 'cards' },
  }).toArray();
  for (const group of groups) {
    const isCreated = await Fields.findOne({
      groupId: group._id,
      text: 'Name',
    });

    if (!isCreated) {
      await Fields.insertOne({
        _id: generateMongoId(),
        groupId: group._id,
        contentType: group.contentType,
        text: 'Name',
        type: 'text',
        field: 'name',
        isVisibleToCreate: true,
        isDefinedByErxes: true,
      });
    }
  }
  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
