const dotenv = require('dotenv');
dotenv.config();

const { MongoClient } = require('mongodb');
const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db;
let Assets;
let Tickets;
let Tasks;
let Deals;

const command = async () => {
  console.log(`starting ... ${MONGO_URL}`);

  await client.connect();
  console.log('db connected ...');

  db = client.db();

  Assets = db.collection('assets');
  Tickets = db.collection('tickets');
  Tasks = db.collection('tasks');
  Deals = db.collection('deals');

  const modelsMap = [
    {
      type: 'ticket',
      collection: Tickets
    },
    {
      type: 'task',
      collection: Tasks
    },
    {
      type: 'deal',
      collection: Deals
    }
  ];
  try {
    console.log('starting fetch asset ids');

    const assets = await Assets.find().toArray();
    const assetIds = assets.map(asset => asset._id);

    console.log(`fetched ${assetIds?.length || 0} assets`);

    for (let models of modelsMap) {
      console.log(`${models.type} starting...`);

      let itemsWithAssets = await models.collection
        .find({ 'customFieldsData.value': { $in: assetIds } })
        .toArray();

      console.log(`Found ${itemsWithAssets?.length || 0} items`);

      let bulkOps = itemsWithAssets.map(item => {
        const field = (item?.customFieldsData || []).find(customFieldData =>
          assetIds.includes(customFieldData.value)
        );

        const asset = assets.find(asset => asset._id === field.value);

        return {
          updateOne: {
            filter: { _id: item._id, 'customFieldsData.field': field.field },
            update: { $set: { 'customFieldsData.$.extraValue': asset.name } }
          }
        };
      });

      console.log(`${bulkOps?.length || 0} item will be updated`);

      if (bulkOps?.length > 0) {
        try {
          await models.collection.bulkWrite(bulkOps);
          console.log(`${bulkOps?.length || 0} items updated successfully`);
        } catch (e) {
          console.log('Error occurred:', e.message);
        }
      }

      console.log(`${models.type} done.......`);
    }
  } catch (error) {
    console.log('Error occurred:', error.message);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};
command();
