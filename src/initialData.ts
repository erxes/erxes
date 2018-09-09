#!/usr/bin/env node
'use strict';

import { Brands, Channels, Forms, Integrations, Users } from './db/models';

import { connect, disconnect } from './db/connection';
import {
  companyFactory,
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  fieldFactory,
  formFactory,
  knowledgeBaseArticleFactory,
  knowledgeBaseCategoryFactory,
  knowledgeBaseTopicFactory,
  responseTemplateFactory,
  segmentFactory,
} from './db/factories';

export const importData = async () => {
  connect();

  // create admin user
  const user = await Users.createUser({
    username: 'admin',
    password: 'p4$$w0rd',
    email: 'admin@erxes.io',
    isOwner: true,
    role: 'admin',
    details: {
      fullName: 'Admin',
    },
  });

  // messenger integration =================
  const brand = await Brands.createBrand({
    name: 'Local publisher',
    code: 'YDEdKj',
  });

  const messengerIntegration = await Integrations.createIntegration({
    name: 'Messenger for Local publisher',
    kind: 'messenger',
    brandId: brand._id,
  });

  // create customers & companies & conversations ================
  for (let i = 1; i <= 10; i++) {
    const company = await companyFactory({});
    const customer = await customerFactory({ companyIds: [company._id] });
    await segmentFactory({});

    const conversation = await conversationFactory({
      customerId: customer._id,
      integrationId: messengerIntegration._id,
    });

    await conversationMessageFactory({ conversationId: conversation._id });

    if (i > 7) {
      await responseTemplateFactory({ brandId: brand._id });
    }
  }

  // create form integration ====================
  const form = await formFactory({
    createdUserId: user._id,
  });

  await Forms.update({ _id: form._id }, { $set: { code: 'mRgzZw' } });

  await fieldFactory({ contentType: 'form', contentTypeId: form._id });
  await fieldFactory({ contentType: 'form', contentTypeId: form._id });
  await fieldFactory({ contentType: 'form', contentTypeId: form._id });

  const formIntegration = await Integrations.createIntegration({
    name: 'Form',
    kind: 'form',
    brandId: brand._id,
    formId: form._id,
    formData: {
      loadType: 'embedded',
      thankContent: 'thankContent',
    },
  });

  await Channels.createChannel(
    {
      name: 'Sales',
      integrationIds: [messengerIntegration._id, formIntegration._id],
      memberIds: [user._id],
    },
    user._id,
  );

  // knowledgebase =========
  const kbCategory = await knowledgeBaseCategoryFactory({ userId: user._id });

  await knowledgeBaseTopicFactory({
    categoryIds: [kbCategory._id],
    userId: user._id,
  });

  await knowledgeBaseArticleFactory({
    categoryIds: [kbCategory._id],
    userId: user._id,
  });

  disconnect();
};

importData();
