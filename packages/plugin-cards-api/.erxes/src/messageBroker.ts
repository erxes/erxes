import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { generateFields } from '../../src/fieldUtils';

dotenv.config();

export const initBroker = async (name, server) => {
  const client = await messageBroker({
    name,
    server,
    envs: process.env
  });

  const { consumeRPCQueue } = client;

  consumeRPCQueue(`${name}:rpc_queue:getFields`, async args => ({
    status: 'success',
    data: await generateFields(args)
  }));
};
