import shortid from 'shortid';
import faker from 'faker';
import { Users, Tags, Segments } from './models';

export const userFactory = (params = {}) => {
  const user = new Users({
    username: params.username || faker.random.word(),
    details: {
      fullName: params.fullName || faker.random.word(),
    },
  });

  return user.save();
};

export const tagsFactory = (params = {}) => {
  const tag = new Tags({
    name: faker.random.word(),
    type: params.type || faker.random.word(),
    colorCode: params.colorCode || shortid.generate(),
    userId: shortid.generate(),
  });

  return tag.save();
};

export const segmentsFactory = (params = {}) => {
  const segment = new Segments({
    name: faker.random.word(),
  });

  return segment.save();
};
