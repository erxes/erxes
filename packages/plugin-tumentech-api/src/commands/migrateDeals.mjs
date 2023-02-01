import mongoDb from 'mongodb';

var MongoClient = mongoDb.MongoClient;

var MONGO_URL = process.argv[2];

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

var client = new MongoClient(MONGO_URL);

console.log('Connected to ', MONGO_URL);

let db;

let Deals;
let Stages;

var command = async () => {
  await client.connect();
  db = client.db();

  Deals = db.collection('deals');
  Stages = db.collection('stages');

  const stageCodes = [
    'newOrder',
    'driverFound',
    'orderAgain',
    'negotiationAccepted',
    'advancePaid',
    'driverCanceled',
    'driverNotFound',
    'clientCanceled',
    'prePaymentContract',
    'start',
    'ready',
    'load',
    'loadAccepted',
    'gone',
    'break',
    'discoveredBreak',
    'end',
    'unload',
    'unloadFinish',
    'getPaid',
    'complete',
    'fight',
    'paymentContract',
  ];

  const stages = await Stages.find({ code: { $in: stageCodes } }).toArray();

  for (var stage of stages) {
    await Deals.deleteMany({ stageId: stage._id });
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
