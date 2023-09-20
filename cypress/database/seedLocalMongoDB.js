const MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require("mongodb");
const users = require("./users.json");
const tags = require("./tags.json");

const DB = "erxes";

const oidToObjectId = (jsonData) =>
  jsonData.map((item) =>
    !!item.realtor
      ? {
          ...item
          // _id: ObjectId(32),
          // realtor: ObjectId(32),
        }
      : {
          ...item
          // _id: ObjectId(32),
        }
  );

async function dropAndSeed(mongoClient, collectionName, jsonData) {
  const collection = mongoClient.db(DB).collection(collectionName);

  await collection.drop().catch((e) => {
    console.log("error when dropping", e);
    if (e.code !== 26) {
      throw e;
    }
  });
  await collection.insertMany(oidToObjectId(jsonData));
}

async function seedDB() {
  // Connection URL

  const uri = `mongodb://localhost:27017/${DB}`;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();

    console.log("Connected correctly to server");

    await dropAndSeed(client, "users", users);
    await dropAndSeed(client, "tags", tags);

    console.log("Database seeded! :)");

    client.close();
  } catch (err) {
    console.log(err.stack);
  }
}

seedDB();