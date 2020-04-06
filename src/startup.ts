import { Users } from './db/models';
import { addToArray } from './redisClient';

const init = async () => {
  const userIds = await Users.find({}).distinct('_id');

  userIds.forEach(id => {
    addToArray('userIds', id);
  });
};

export default init;
