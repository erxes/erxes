const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1/erxes';

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db;
let Tags;

const setOrder = async (tags, parentTag) => {
  console.log(parentTag?.code)
  for (const tag of tags) {
    const parentOrder = parentTag ? parentTag.order : '' || '';
    await Tags.updateOne(
      { _id: tag._id },
      { $set: { order: `${parentOrder}${tag.name}/` } }
    );

    const childs =
      (await Tags.find({ parentId: tag._id }).toArray()) ||
      [];

    if (childs.length) {
      await setOrder(childs, tag);
    }
  }
};

const command = async () => {
  await client.connect();
  db = client.db();

  Tags = db.collection('tags');

  const rootTags =
    (await Tags.find({
      parentId: { $in: ['', null, undefined] }
    }).toArray()) || [];
  await setOrder(rootTags);

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
