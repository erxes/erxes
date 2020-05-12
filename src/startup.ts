import * as fs from 'fs';
import { Users } from './db/models';
import { addToArray } from './redisClient';

export const cacheUsers = async () => {
  const userIds = await Users.find({}).distinct('_id');

  userIds.forEach(id => {
    addToArray('userIds', id);
  });
};

export const makeDirs = () => {
  const dir = `${__dirname}/private/xlsTemplateOutputs`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

const init = async () => {
  await cacheUsers();
  makeDirs();
};

export default init;
