import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { generateFields } from './fieldUtils';
import { prepareImportDocs } from './importUtils';

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

  consumeRPCQueue(`${name}:rpc_queue:prepareImportDocs`, async args => ({
    status: 'success',
    data: await prepareImportDocs(args)
  }));
};
