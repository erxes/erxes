import faker from 'faker';
import Random from 'meteor-random';
import { MODULES, CONVERSATION_STATUSES } from '../data/constants';

import {
  Users,
  Brands,
  EmailTemplates,
  ResponseTemplates,
  ConversationMessages,
  Conversations,
  Integrations,
  Tags,
  Forms,
  FormFields,
  NotificationConfigurations,
  Notifications,
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

export const integrationFactory = params => {
  const kind = params.kind || 'messenger';
  return Integrations.create({
    name: faker.random.word(),
    kind: kind,
    brandId: params.brandId || Random.id(),
    formId: params.formId || Random.id(),
    messengerData: params.messengerData || { welcomeMessage: 'welcome' },
    formData:
      params.formData === 'form'
        ? params.formData
        : kind === 'form' ? { thankContent: 'thankContent' } : null,
  });
};

export const tagsFactory = (params = {}) => {
  const tag = new Tags({
    name: faker.random.word(),
    type: params.type || faker.random.word(),
    colorCode: params.colorCode || Random.id(),
    userId: Random.id(),
  });

  return tag.save();
};

export const formFactory = async ({ title, code, description, createdUserId }) => {
  return Forms.createForm(
    {
      title: title || faker.random.word(),
      description: description || faker.random.word(),
      code: code || Random.id(),
    },
    createdUserId || (await userFactory({})),
  );
};

export const formFieldFactory = (formId, params) => {
  return FormFields.createFormField(formId || Random.id(), {
    type: params.type || 'input',
    name: faker.random.word(),
    validation: params.validation || 'number',
    text: faker.random.word(),
    description: faker.random.word(),
    isRequired: params.isRequired || false,
    number: faker.random.word(),
  });
};

export const notificationConfigurationFactory = params => {
  let { isAllowed } = params;
  if (isAllowed == null) {
    isAllowed = true;
  }

  return NotificationConfigurations.createOrUpdateConfiguration(
    {
      notifType: params.notifType || MODULES.CHANNEL_MEMBERS_CHANGE,
      // which module's type it is. For example: indocuments
      isAllowed,
    },
    params.user || userFactory({}),
  );
};

export const notificationFactory = params => {
  return Notifications.createNotification({
    notifType: params.notifType || MODULES.CHANNEL_MEMBERS_CHANGE,
    createdUser: params.createdUser || userFactory({}),
    title: params.title || 'new Notification title',
    content: params.content || 'new Notification content',
    link: params.link || 'new Notification link',
    receiver: params.receiver || userFactory({}),
  });
};
