import * as dotenv from 'dotenv';
import { MESSAGE_KINDS } from '../data/constants';
import { connect } from '../db/connection';
import { EngageMessages } from '../db/models';

dotenv.config();

const command = async () => {
  await connect();

  const campaigns = await EngageMessages.find({
    kind: { $ne: MESSAGE_KINDS.VISITOR_AUTO },
    tagIds: { $exists: true, $not: { $size: 0 } },
    customerTagIds: { $exists: false }
  });

  console.log(`Found ${campaigns.length} campaigns`);

  const bulkOptions: any[] = [];

  for (const campaign of campaigns) {
    bulkOptions.push({
      updateOne: {
        filter: {
          _id: campaign._id
        },
        update: {
          $set: {
            customerTagIds: campaign.tagIds || []
          }
        }
      }
    });
  }

  if (bulkOptions.length > 0) {
    await EngageMessages.bulkWrite(bulkOptions);
  }

  console.log(`Completed with ${bulkOptions.length} rows`);

  process.exit();
};

command();
