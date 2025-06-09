import { getEnv } from "@erxes/api-utils/src";
import redis from "@erxes/api-utils/src/redis";
import { getOrganizations } from "@erxes/api-utils/src/saas/saas";
import * as mongoose from "mongoose";
import { sendCommonMessage } from "./messageBroker";

const collections = ["customers", "companies", "users"];

const activeChangeStreams: mongoose.mongo.ChangeStream[] = [];

const getSubdomain = (domain: string) => {
  const hostname = domain.replace(/^(https?:\/\/)/, "");

  const firstPart = hostname.split(".")[0];

  return firstPart.split(":")[0];
};

const handleLoyaltyChangeStream = ({
  db,
  subdomain,
}: {
  db: mongoose.Connection;
  subdomain: string;
}) => {
  for (const collectionName of collections) {
    let collection = db.collection(collectionName);

    try {
      const changeStream = collection.watch([
        { $match: { operationType: "insert" } },
      ]);

      if (!changeStream) {
        continue;
      }

      activeChangeStreams.push(changeStream);

      changeStream.on("change", async (data: any) => {
        try {
          if (data.operationType === "insert") {
            sendCommonMessage({
              subdomain: subdomain,
              serviceName: "automations",
              action: "trigger",
              data: {
                type: "loyalties:reward",
                targets: [data.fullDocument],
              },
              defaultValue: [],
            });
          }
        } catch (error) {
          console.error("Error handling change event:", error);
        }
      });

      changeStream.on("error", (error) => {
        console.error("Error in customer stream:", error);
        changeStream.close();
      });
    } catch (error) {
      console.error("Error starting change stream for", collectionName, error);
    }
  }
};

// Register signal handlers only once
const setupSignalHandlers = (() => {
  let isSetup = false;

  return () => {
    if (isSetup) return;
    isSetup = true;

    ["SIGINT", "SIGTERM"].forEach((sig) => {
      process.on(sig, async () => {
        console.log("Closing all change streams...");
        for (const stream of activeChangeStreams) {
          await stream.close();
        }
      });
    });
  };
})();

export default async () => {
  setupSignalHandlers();

  const VERSION = getEnv({ name: "VERSION" });

  if (VERSION && VERSION === "saas") {
    const orgs = await getOrganizations();

    for (const org of orgs) {
      if (!org) {
        continue;
      }

      const DB_NAME = getEnv({ name: "DB_NAME" });

      const GE_MONGO_URL = (DB_NAME || "erxes_<organizationId>").replace(
        "<organizationId>",
        org?._id
      );

      const db = mongoose.connection.useDb(GE_MONGO_URL);

      handleLoyaltyChangeStream({
        db,
        subdomain: org?.subdomain,
      });
    }
  } else {
    const hostname = await redis.get("hostname");

    const db = mongoose.connection;

    if (!hostname) {
      return;
    }

    handleLoyaltyChangeStream({
      db,
      subdomain: getSubdomain(hostname),
    });
  }
};
