import * as dotenv from 'dotenv';
import { stream } from '../data/bulkUtils';
import { connect } from '../db/connection';
import { Conversations, Customers } from '../db/models';

dotenv.config();

const command = async () => {
  console.log(`Process started at: ${new Date()}`);

  await connect();

  const customers = await Customers.aggregate([
    { $match: { $and: [{ state: 'visitor' }, { profileScore: 0 }] } },
    { $project: { _id: '$_id' } }
  ]);

  const customerIds = customers.map(c => c._id);

  const conversations = await Conversations.find().distinct('customerId');

  const idsToRemove = customerIds.filter(e => !conversations.includes(e));

  let deletedCount = 0;

  await stream(
    async chunk => {
      deletedCount = deletedCount + chunk.length;
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
