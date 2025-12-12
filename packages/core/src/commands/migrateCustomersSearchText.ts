import * as dotenv from "dotenv";
dotenv.config();

import { Collection, Db, MongoClient, AnyBulkWriteOperation } from "mongodb";
import { validSearchText } from "@erxes/api-utils/src";

const { MONGO_URL } = process.env;
if (!MONGO_URL) throw new Error("Environment variable MONGO_URL not set.");

const client = new MongoClient(MONGO_URL);
let db: Db;
let Customers: Collection<any>;

const fillSearchText = (doc: any) => {
  const searchText = [
    (doc.emails || []).map((e: any) => e.email).join(" "),
    (doc.phones || []).map((p: any) => p.phone).join(" "),
    doc.firstName || "",
    doc.lastName || "",
    doc.middleName || "",
    doc.primaryEmail || "",
    doc.primaryPhone || "",
    doc.registrationNumber || "",
  ];
  console.log("Processing customer:", doc._id, searchText);

  const existingSearchText = doc.searchText?.split(" ").filter(Boolean) || [];
  const searchTexts = [...new Set([...searchText, ...existingSearchText])];

  return validSearchText(searchTexts);
};

const command = async () => {
  await client.connect();
  db = client.db();
  Customers = db.collection("customers");

  const bulkOperations: AnyBulkWriteOperation<any>[] = [];
  const cursor = Customers.find({});

  while (await cursor.hasNext()) {
    const customer = await cursor.next();
    bulkOperations.push({
      updateOne: {
        filter: { _id: customer._id },
        update: { $set: { searchText: fillSearchText(customer) } },
      },
    });

    if (bulkOperations.length === 500) {
      await Customers.bulkWrite(bulkOperations);
      bulkOperations.length = 0;
    }
  }

  if (bulkOperations.length) {
    await Customers.bulkWrite(bulkOperations);
  }

  console.log(`Process finished at: ${new Date()}`);
  await client.close();
  process.exit(0);
};

command().catch((err) => {
  console.error("Error in migration:", err);
  process.exit(1);
});
