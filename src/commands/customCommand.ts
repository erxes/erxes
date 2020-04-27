import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { Customers } from '../db/models';

dotenv.config();

const command = async () => {
  await connect();

  const argv = process.argv;
  const limit = argv.pop();

  const selector = {
    relatedIntegrationIds: { $exists: false },
    integrationId: { $exists: true, $ne: null },
    profileScore: { $gt: 0 },
  };

  const customers = await Customers.find(selector).limit(limit ? parseInt(limit, 10) : 10000);

  console.log(`Limit: ${limit}, length: ${customers.length}`);

  const bulkOptions: any[] = [];

  for (const customer of customers) {
    if (!customer.integrationId) {
      continue;
    }

    bulkOptions.push({
      updateOne: {
        filter: {
          _id: customer._id,
        },
        update: {
          $set: {
            relatedIntegrationIds: [customer.integrationId],
          },
        },
      },
    });
  }

  await Customers.bulkWrite(bulkOptions);

  process.exit();
};

command();
