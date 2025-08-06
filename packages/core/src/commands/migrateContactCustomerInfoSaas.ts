import { getOrganizations } from "@erxes/api-utils/src/saas/saas";
import * as dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const { MONGO_URL = "mongodb://127.0.0.1:27017/erxes?directConnection=true" } =
  process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

let db;

let Customers;

const command = async () => {
  const organizations = await getOrganizations();

  console.time("start time");

  for (const org of organizations) {
    try {
      console.debug(MONGO_URL, org._id);

      const client = new MongoClient(
        MONGO_URL.replace("<organizationId>", org._id)
      );

      await client.connect();
      db = client.db();

      Customers = db.collection("customers");

      const customers = await Customers.find({}).toArray();

      for (const customer of customers) {
        const {
          _id,
          primaryEmail,
          primaryPhone,
          emails = [],
          phones = [],
          phoneValidationStatus,
          emailValidationStatus,
        } = customer || {};

        const newEmails: any[] = [];
        const newPhones: any[] = [];

        if (primaryEmail && !emails.includes(primaryEmail)) {
          emails.unshift(primaryEmail);
        }

        for (const email of emails) {
          if (!email || typeof email !== "string") {
            console.warn(`Skipping invalid email for customer ${_id}:`, email);
            continue;
          }

          if (email === primaryEmail) {
            newEmails.push({
              email,
              type: "primary",
              status: emailValidationStatus,
            });

            continue;
          }

          newEmails.push({ email, type: "other", status: "unknown" });
        }

        if (primaryPhone && !phones.includes(primaryPhone)) {
          phones.unshift(primaryPhone);
        }

        for (const phone of phones) {
          if (!phone || typeof phone !== "string") {
            console.warn(`Skipping invalid phone for customer ${_id}:`, phone);
            continue;
          }

          if (phone === primaryPhone) {
            newPhones.push({
              phone,
              type: "primary",
              status: phoneValidationStatus,
            });

            continue;
          }

          newPhones.push({ phone, type: "other", status: "unknown" });
        }

        await Customers.updateOne(
          { _id },
          { $set: { emails: newEmails, phones: newPhones } }
        );
      }

      console.debug("migrated", org.subdomain);
    } catch (e) {
      console.error("Error occurred: ", e);
    }
  }

  console.debug(`Process finished at: ${new Date()}`);
  console.timeEnd("start time");

  process.exit();
};

command();
