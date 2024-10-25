import * as dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";
import { getOrganizations } from "@erxes/api-utils/src/saas/saas";

const { MONGO_URL = "" } = process.env;

if (!MONGO_URL) {
  throw new Error("Environment variable MONGO_URL not set.");
}

// Database migration function
const migrateOrganizationData = async (db) => {
  const Invoices = db.collection("payment_invoices");
  const Payments = db.collection("payment_methods");

  // Update all invoices to set currency to 'MNT'
  await Invoices.updateMany({}, { $set: { currency: "MNT" } });

  // Update all payments to set acceptedCurrencies to ['MNT']
  await Payments.updateMany({}, { $set: { acceptedCurrencies: ["MNT"] } });
};

// Main command function
const command = async () => {
  const organizations = await getOrganizations();

  for (const org of organizations) {
    const client = new MongoClient(MONGO_URL.replace("<organizationId>", org._id));
    
    try {
      console.log(`Connecting to organization DB: ${org._id}`);
      await client.connect();
      
      const db = client.db();

      // Perform migration operations
      await migrateOrganizationData(db);
      console.log(`Migrated data for organization: ${org.subdomain}`);
    } catch (error) {
      console.error(`Error migrating organization ${org.subdomain}:`, error.message);
    } finally {
      // Ensure the MongoClient closes after each organization
      await client.close();
    }
  }

  console.log(`Process finished at: ${new Date()}`);
  process.exit();
};

// Run the command
command();
