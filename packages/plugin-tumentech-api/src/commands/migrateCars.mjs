import  mongoDb from 'mongodb';

var MongoClient = mongoDb.MongoClient;

var  MONGO_URL  = process.argv[2];

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

var client = new MongoClient(MONGO_URL);

console.log("Connected to ", MONGO_URL)

let db;

let Cars;
let CarCategories;

var command = async () => {
  await client.connect();
  db = client.db();

  Cars = db.collection("cars");
  CarCategories = db.collection("car_categories");

  var cars = await Cars.find({}).toArray();

  for (var car of cars) {
    var category = await CarCategories.findOne({ _id: car.categoryId  });

    console.log(category)

    if (!category) {
        continue;
    }

    var parentCategory = await CarCategories.findOne({
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
