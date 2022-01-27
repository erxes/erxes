import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';

dotenv.config();

export const initBroker = async (name, server) => 
  messageBroker({
    name,
    server,
    envs: process.env
  });