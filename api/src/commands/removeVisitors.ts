import * as dotenv from 'dotenv';
import * as ora from 'ora';
import { stream } from '../data/bulkUtils';
import { connect } from '../db/connection';
import { Conversations, Customers } from '../db/models';

dotenv.config();

const command = async () => {
  console.log(`Process started at: ${new Date()}`);

  const spinnerOptions = {
    prefixText: `Collecting visitors`
  };

  const spinner = ora(spinnerOptions);
  spinner.start();

  await connect();

  const customers = await Customers.aggregate([
    { $match: { $and: [{ state: 'visitor' }, { profileScore: 0 }] } },
    { $project: { _id: '$_id' } }
  ]);

  const idsToRemove: string[] = [];

  for (const customer of customers) {
    const conversations = await Conversations.find({
      customerId: customer._id
    });

    if (!conversations || conversations.length === 0) {
      idsToRemove.push(customer._id);
    }
  }

  spinner.info(`collected visitors count: ${idsToRemove.length}`);

  spinner.succeed(
    `Successfully collected visitors. Going to delete ${idsToRemove.length} of ${customers.length}`
  );

  await stream(
    async chunk => {
      await Customers.deleteMany({ _id: { $in: chunk } });
    },
    (variables, root) => {
      const parentIds = variables.parentIds || [];

      parentIds.push(root._id);

      variables.parentIds = parentIds;
    },
    () => {
      return Customers.find(
        {
          _id: { $in: idsToRemove }
        },
        { _id: 1 }
      ) as any;
    },
    1000
  );
};

command().then(() => {
  console.log(`Process finished at: ${new Date()}`);
  process.exit();
});
