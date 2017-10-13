import faker from 'faker';
import Random from 'meteor-random';

import {
  Users,
  Tags,
  Segments,
  Brands,
  EmailTemplates,
  ResponseTemplates,
  EngageMessages,
} from './models';

export const userFactory = (params = {}) => {
  const user = new Users({
    username: params.username || faker.random.word(),
    details: {
      fullName: params.fullName || faker.random.word(),
    },
  });

  return user.save();
};

export const tagsFactory = (params = { type: 'engageMessage' }) => {
  const tag = new Tags({
    name: faker.random.word(),
    type: params.type || faker.random.word(),
    colorCode: params.colorCode || Random.id(),
    userId: Random.id(),
  });

  return tag.save();
};

export const engageMessageFactory = (params = {}) => {
  const engageMessage = new EngageMessages({
    kind: 'manual',
    title: faker.random.word(),
    fromUserId: params.userId || faker.random.word(),
    segmentId: params.segmentId || faker.random.word(),
    isLive: true,
    isDraft: false,
  });

  return engageMessage.save();
};

export const segmentsFactory = () => {
  const segment = new Segments({
    name: faker.random.word(),
  });

  return segment.save();
};

export const brandFactory = (params = {}) => {
  const brand = new Brands({
    name: faker.random.word(),
    code: params.code || faker.random.word(),
    userId: () => Random.id(),
    description: params.description || faker.random.word(),
    emailConfig: {
      type: 'simple',
      template: faker.random.word(),
    },
  });

  return brand.save();
};

export const emailTemplateFactory = (params = {}) => {
  const emailTemplate = new EmailTemplates({
    name: faker.random.word(),
    content: params.content || faker.random.word(),
  });

  return emailTemplate.save();
};

export const responseTemplateFactory = (params = {}) => {
  const responseTemplate = new ResponseTemplates({
    name: faker.random.word(),
    content: params.content || faker.random.word(),
    brandId: params.brandId || Random.id(),
    files: [faker.random.image()],
  });

  return responseTemplate.save();
};
