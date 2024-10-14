import * as dotenv from "dotenv";

dotenv.config();

import { getOrganizations } from "@erxes/api-utils/src/saas/saas";

const { MONGO_URL = "" } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const command = async () => {
  const organizations = await getOrganizations();

  for (const org of organizations) {
    const response = await fetch(
      `https://${org.subdomain}.api.erxes.io/api/initial-setup`
    );

    console.log(response.ok);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
