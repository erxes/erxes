import { Customers, Conversations, ConversationMessages } from './db/models';
import { connect, disconnect } from './db/connection';

export const customCommand = async () => {
  connect();

  const customers = await Customers.find({});

  for (const customer of customers) {
    const csCount = await Conversations.find({ customerId: customer._id }).count();
    const cmsCount = await ConversationMessages.find({ customerId: customer._id }).count();

    console.log(customer._id); // eslint-disable-line

    if (csCount === 0 && cmsCount === 0) {
      await Customers.remove({ _id: customer._id });
      console.log('removed'); // eslint-disable-line
    }
  }

  disconnect();
};

customCommand();
