import * as dotenv from 'dotenv';
import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';

dotenv.config();

let client;

export const initBroker = async () => {
  client = await initBrokerCore();
};

export default function () {
  return client;
}
