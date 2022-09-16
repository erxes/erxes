import  mongoDb from 'mongodb';

var MongoClient = mongoDb.MongoClient;

const  MONGO_URL  = process.argv[2];

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db;

let Cars;
let CarCategories;

const command = async () => {
  await client.connect();
  db = client.db();

  Cars = db.collection("cars");
  CarCategories = db.collection("car_categories");

  const cars = await Cars.find({}).toArray();

  for (const car of cars) {
    const category = await CarCategories.findOne({ _id: car.categoryId  });

    if (!category) {
        continue;
    }

    const parentCategory = await CarCategories.findOne({
      _id: category.parentId
    });

    if (!parentCategory) {
        continue;
    }

    await Cars.updateOne(
      { _id: car._id },
      { $set: { parentCategoryId: parentCategory._id } }
    );
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
