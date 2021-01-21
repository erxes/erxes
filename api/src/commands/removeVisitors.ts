import * as dotenv from 'dotenv';
import { stream } from '../data/bulkUtils';
import { connect } from '../db/connection';
import { Conversations, Customers } from '../db/models';

dotenv.config();

const command = async () => {
  await connect();

  const customerIds = await Customers.find({
    state: 'visitor',
    profileScore: 0
  }).distinct('_id');

  const idsToRemove: string[] = [];

  for (const customerId of customerIds) {
    const conversationExists = await Conversations.exists({
      customerId
    });

    if (!conversationExists) {
      idsToRemove.push(customerId);
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
