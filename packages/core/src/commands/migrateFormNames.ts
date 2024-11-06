import * as dotenv from "dotenv";

dotenv.config();

import { Collection, Db, MongoClient } from "mongodb";

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Integrations: Collection<any>;
let Forms: Collection<any>;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  Integrations = db.collection("integrations");
  Forms = db.collection("forms");

  const leadIntegrations = await Integrations.find({ kind: "lead" }).toArray();

  for (const integration of leadIntegrations) {
    const form = await Forms.findOne({ _id: integration.formId });

    if (form) {
      await Forms.updateOne({ _id: form._id }, { $set: { name: integration.name } });
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
