const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config();

const MONGO_URL = 'mongodb://localhost/erxes'

const client = new MongoClient(MONGO_URL);
let db;

dotenv.config();

const command = async () => {
  console.log(`start.... ${MONGO_URL}`);

  await client.connect();
  db = client.db();
  console.log('connected...');

  Configs = db.collection('configs');
  SyncerkhetConfigs = db.collection('syncerkhet_configs');

  keys = ['ERKHET', 'ebarimtConfig', 'stageInMoveConfig', 'returnEbarimtConfig', 'remainderConfig']

  for (const key of keys) {
    const config = await Configs.findOne({ code: key });

    if (config) {
      await SyncerkhetConfigs.updateOne({ code: key }, {
        $set: {
          _id: config._id,
          code: key,
          value: config.value
        }
      }, { upsert: true })
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
