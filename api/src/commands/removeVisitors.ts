import * as dotenv from 'dotenv';
import { stream } from '../data/bulkUtils';
import { connect } from '../db/connection';
import { Conversations, Customers } from '../db/models';

dotenv.config();

const command = async () => {
  await connect();

  const customers = await Customers.aggregate([
    { $match: { $and: [{ state: 'visitor' }, { profileScore: 0 }] } },
    { $project: { _id: '$_id' } }
  ]);

  const idsToRemove: string[] = [];

  for (const customer of customers) {
    const conversationExists = await Conversations.exists({
      customerId: customer._id
    });

    if (!conversationExists) {
      idsToRemove.push(customer._id);
    }
  }

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
  process.exit();
});
