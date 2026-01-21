const dotenv = require('dotenv');
const { nanoid } = require('nanoid')
const { MongoClient } = require('mongodb');

dotenv.config();

const { MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true' } = process.env;

const client = new MongoClient(MONGO_URL);
let db;
let CoreConfigs;
let MNConfigs;

codes = [
  { code: 'EBARIMT', hasSubId: false },
  { code: 'returnStageInEbarimt', hasSubId: true },
  { code: 'stageInEbarimt', hasSubId: true }]

const command = async () => {
  await client.connect();
  console.log(Boolean(client))
  db = client.db();
  console.log(Boolean(db))

  CoreConfigs = db.collection('configs');
  MNConfigs = db.collection('mongolian_configs');

  const now = new Date();
  console.log(`Process start at: ${new Date()}`);

  for (const item of codes) {
    const { code, hasSubId } = item;
    const coreConfig = await CoreConfigs.findOne({ code });
    if (!coreConfig) {
      continue;
    }

    oldMNConfigs = await MNConfigs.find({ code }).toArray();

    if (oldMNConfigs.length) {
      continue;
    }

    const { value } = coreConfig;

    if (hasSubId) {
      const subIds = Object.keys(value);
      for (const subId of subIds) {
        await MNConfigs.insertOne({ _id: nanoid(), code, subId, value: value[subId] });
      }
    } else {
      await MNConfigs.insertOne({ _id: nanoid(), code, subId: '', value })
    }
  }

  console.log(`Process finished at: ${now}`);

  process.exit();
};

command();
