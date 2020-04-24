import * as fs from 'fs';
import { Users } from './db/models';
import { addToArray } from './redisClient';

const init = async () => {
  const userIds = await Users.find({}).distinct('_id');

  userIds.forEach(id => {
    addToArray('userIds', id);
  });

  const makeDirs = () => {
    const dir = `${__dirname}/private/xlsTemplateOutputs`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  };

  makeDirs();
};

export default init;
