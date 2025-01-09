import * as dotenv from "dotenv";

dotenv.config();

import { MongoClient } from "mongodb";

import { getOrganizations } from "@erxes/api-utils/src/saas/saas";

const { MONGO_URL = "" } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

let db;

const command = async () => {
  const organizations = await getOrganizations();

  for (const org of organizations) {
    try {
      console.log(MONGO_URL, org._id);
      const client = new MongoClient(
        MONGO_URL.replace("<organizationId>", org._id)
      );

      await client.connect();
      db = client.db();

      const Integrations = db.collection("integrations");
      const Forms = db.collection("forms");

      const leadIntegrations = await Integrations.find({
        kind: "lead"
      }).toArray();

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
            status: integration.isActive ? "active" : "archived"
          };

          console.log(JSON.stringify(formDoc, null, 2));

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

      // remove orphan forms

      const forms = await Forms.find({ type: "lead" }).toArray();
      for (const form of forms) {
        const integration = await Integrations.findOne({ formId: form._id });
        if (!integration) {
          console.log("removing", form);
          await Forms.deleteOne({ _id: form._id });
        }
      }

      console.log("migrated", org.subdomain);
    } catch (e) {
      console.error(e.message);
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
