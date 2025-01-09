import * as dotenv from "dotenv";

dotenv.config();
const { MONGO_URL } = process.env;

import { Collection, Db, MongoClient } from "mongodb";

const client = new MongoClient(
  MONGO_URL ||
    "mongodb://127.0.0.1:27017/erxes?directConnection=true&retryWrites=true"
);

let db: Db;
let Users: Collection<any>;
let Customers: Collection<any>;
let Companies: Collection<any>;
let ScoreLogs: Collection<any>;

const getCollection = (ownerType): Collection<any> => {
  if (ownerType === "customer") {
    return Customers;
  }
  if (ownerType === "company") {
    return Companies;
  }

  return Users;
};

const command = async () => {
  console.log(
    `starting ... ${MONGO_URL || "mongodb://127.0.0.1:27017/erxes?directConnection=true&retryWrites=true"}`
  );

  await client.connect();
  console.log("db connected ...");

  console.log("starting get collections...");
  db = client.db();

  Users = db.collection("users");
  Customers = db.collection("customers");
  Companies = db.collection("companies");
  ScoreLogs = db.collection("score_logs");
  console.log("successfully get collections...");

  const scorelogs = await ScoreLogs.aggregate([
    {
      $match: { createdAt: { $lte: new Date("2024-10-05") } }
    },
    {
      $group: {
        _id: "$ownerType",
        logs: { $push: "$$ROOT" }
      }
    }
  ]).toArray();

  for (const { _id: ownerType, logs } of scorelogs) {
    console.log(`starting ${ownerType} score logs for cleaning `);

    const rows: any = [];

    for (const { ownerId } of logs) {
      rows.push({
        updateOne: { filter: { _id: ownerId }, update: { $set: { score: 0 } } }
      });
    }

    console.log(`Found ${rows.length} : ${ownerType} score logs `);

    await getCollection(ownerType).bulkWrite(rows);

    console.log(`Completed ${rows.length} : ${ownerType} score logs cleaned`);
  }
  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
