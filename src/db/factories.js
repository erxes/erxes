import faker from 'faker';
import Random from 'meteor-random';

import {
  Users,
  Brands,
  EmailTemplates,
  ResponseTemplates,
  ConversationMessages,
  Conversations,
} from './models';
import { CONVERSATION_STATUSES } from '../data/constants';

export const userFactory = (params = {}) => {
  const user = new Users({
    username: params.username || faker.random.word(),
    details: {
      fullName: params.fullName || faker.random.word(),
    },
  });

  return user.save();
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

export const conversationFactory = (params = {}) => {
  const conversation = new Conversations({
    content: params.content || faker.lorem.sentence(),
    customerId: params.customerId || Random.id(),
    integrationId: params.integrationId || Random.id(),
    status: CONVERSATION_STATUSES.NEW,
  });

  return conversation.save();
};

export const conversationMessageFactory = (params = {}) => {
  const conversationMessage = new ConversationMessages({
    content: params.content || faker.random.word(),
    attachments: {},
    mentionedUserIds: params.mentionedUserIds || [Random.id()],
    conversationId: params.conversationId || Random.id(),
    internal: params.internal || true,
    customerId: params.customerId || Random.id(),
    userId: params.userId || Random.id(),
    createdAt: new Date(),
    isCustomerRead: params.isCustomerRead || true,
    engageData: params.engageData || {},
    formWidgetData: params.formWidgetData || {},
    facebookData: params.facebookData || {},
  });

  return conversationMessage.save();
};
