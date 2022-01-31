import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { Deals, Fields, GrowthHacks, Tasks, Tickets } from '../db/models';

dotenv.config();

const fixCustomFieldsData = async collection => {
  const items = await collection
    .find({
      customFieldsData: { $exists: true, $ne: [] }
    })
    .select({ customFieldsData: 1 })
    .lean();

  console.log(`Found ${items.length} ${collection.modelName}`);

  const bulkOperations: any[] = [];

  for (const item of items) {
    const customFieldsData = await Fields.prepareCustomFieldsData(
      item.customFieldsData
    );
    bulkOperations.push({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { customFieldsData } }
      }
    });
  }

  if (bulkOperations.length) {
    await collection.bulkWrite(bulkOperations);
  }
};

const command = async () => {
  await connect();

  await fixCustomFieldsData(Deals);
  await fixCustomFieldsData(Tickets);
  await fixCustomFieldsData(Tasks);
  await fixCustomFieldsData(GrowthHacks);

  console.log('Finished.');
  process.exit();
};

command();
