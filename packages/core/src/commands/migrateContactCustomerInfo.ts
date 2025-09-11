import * as dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const { MONGO_URL = "mongodb://127.0.0.1:27017/erxes?directConnection=true" } =
  process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db;

let Customers;

const command = async () => {
  console.time("start time");

  try {
    await client.connect();
    console.debug("Connected to ", MONGO_URL);
    db = client.db();

    Customers = db.collection("customers");

    const customers = await Customers.find({}, { batchSize: 1000 });

    let bulkOps: any[] = [];
    let counter = 0;

    for await (const customer of customers) {
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

      bulkOps.push({
        updateOne: {
          filter: { _id },
          update: { $set: { emails: newEmails, phones: newPhones } },
        },
      });

      if (bulkOps.length === 1000) {
        await Customers.bulkWrite(bulkOps, { ordered: false });

        counter += bulkOps.length;

        console.log(`Processed ${counter} customers`);

        bulkOps = [];
      }
    }

    if (bulkOps.length > 0) {
      await Customers.bulkWrite(bulkOps, { ordered: false });

      counter += bulkOps.length;

      console.log(`Processed ${counter} customers (final)`);
    }
  } catch (e) {
    console.error("Error occurred: ", e);
  }

  console.debug(`Process finished at: ${new Date()}`);
  console.timeEnd("start time");

  process.exit();
};

command();
