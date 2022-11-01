import mongoDb from 'mongodb';

var MongoClient = mongoDb.MongoClient;

var MONGO_URL = process.argv[2];

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

var client = new MongoClient(MONGO_URL);

console.log('Connected to ', MONGO_URL);

let db;

let Cars;

var command = async () => {
  await client.connect();
  db = client.db();

  Cars = db.collection('cars');

  await Cars.updateMany(
    {},
    {
      $rename: {
        parentCategoryId: 'parentCarCategoryId',
        categoryId: 'carCategoryId'
      }
    }
  );

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
