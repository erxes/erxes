import * as dotenv from 'dotenv';
import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';

dotenv.config();

let client;

export const initBroker = async options => {
  client = await initBrokerCore(options);
};

export default function() {
  return client;
}
