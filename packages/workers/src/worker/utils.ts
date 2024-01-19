import * as mongoose from 'mongoose';
import { initBroker } from '../messageBroker';
const { MONGO_URL = '' } = process.env;

export const connect = async () => {
  await initBroker().catch((e) => {
    console.log(`Error ocurred during message broker init ${e.message}`);
  });

  return mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
  });
};
