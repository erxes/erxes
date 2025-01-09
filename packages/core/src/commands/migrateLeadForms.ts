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
      const formDoc = {
        brandId: integration.brandId,
        leadData: integration.leadData,
        name: integration.name,
        visibility: integration.visibility,
        departmentIds: integration.departmentIds,
        tagIds: integration.tagIds,
        kind: integration.kind,
        languageCode: integration.languageCode,
        integrationId: integration._id,
        status: integration.isActive ? "active" : "archived",
      };

      await Forms.updateOne({ _id: form._id }, { $set: formDoc });

      const integrationDoc = {
        kind: integration.kind,
        name: integration.name,
        brand: integration.brandId,
        isActive: integration.isActive,
        scopeBrandIds: integration.scopeBrandIds,
        tagIds: integration.tagIds,
        createdUserId: integration.createdUserId,
        createdAt: integration.createdAt
      };
      await Integrations.updateOne(
        { _id: integration._id },
        { $set: integrationDoc }
      );
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
