import mongoDb from 'mongodb';

var MongoClient = mongoDb.MongoClient;

var MONGO_URL = process.argv[2];

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

var client = new MongoClient(MONGO_URL);

console.log('Connected to ', MONGO_URL);

let db;

let Conformity;
let Car;

var command = async () => {
  await client.connect();
  db = client.db();

  Conformity = db.collection('conformities');
  Car = db.collection('cars');

  var conformities = await Conformity.find({}).toArray();

  for (var conformity of conformities) {
    await Car.updateOne({}, { $push: { customerIds: conformity.mainTypeId } });
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
