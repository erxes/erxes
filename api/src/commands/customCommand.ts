import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { Deals, GrowthHacks, Tasks, Tickets } from '../db/models';

dotenv.config();

const fixStageChangedDates = async collection => {
  const items = await collection.find({ stageChangedDate: { $exists: false } });

  console.log('found: ', items.length);

  for (const item of items) {
    await collection.update(
      { _id: item._id },
      { $set: { stageChangedDate: item.createdAt } }
    );
  }
};

const command = async () => {
  await connect();

  await fixStageChangedDates(Deals);
  await fixStageChangedDates(Tickets);
  await fixStageChangedDates(Tasks);
  await fixStageChangedDates(GrowthHacks);

  process.exit();
};

command();
