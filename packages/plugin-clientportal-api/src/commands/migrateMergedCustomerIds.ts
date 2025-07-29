import * as dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db;

let ClientPortalUsers;
let ActivityLogs;

const command = async () => {
  console.time("start time");

  try {
    await client.connect();
    console.debug("Connected to ", MONGO_URL);
    db = client.db();

    ClientPortalUsers = db.collection("client_portal_users");
    ActivityLogs = db.collection("activity_logs");

    const activityLogs = await ActivityLogs.find({
      contentType: "core:customer",
      action: "merge",
    }).toArray();

    for (const activityLog of activityLogs) {
      const { contentId, content } = activityLog || {};

      await ClientPortalUsers.updateMany(
        { erxesCustomerId: { $in: content } },
        { $set: { erxesCustomerId: contentId } }
      );
    }
  } catch (e) {
    console.error("e ", e);
  }

  console.debug(`Process finished at: ${new Date()}`);
  console.timeEnd("end time");

  process.exit();
};

command();
