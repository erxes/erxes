#!/usr/bin/env node
'use strict';

import {
  Users,
  Brands,
  Integrations,
  Channels
} from './db/models';
import {
  customerFactory,
  companyFactory,
  segmentsFactory,
  conversationFactory,
  responseTemplateFactory,
  formFactory,
  conversationMessageFactory
} from './db/factories'
import { connect, disconnect } from './db/connection';


export const importData = async () => {
  connect();

  const user = await Users.createUser({
    username: 'admin',
    password: 'admin123',
    email: 'admin@erxes.io',
    role: 'admin',
    details: {}
  });

  const brand = await Brands.createBrand({
    name: 'Local publisher',
    code: 'YDEdKj'
  });

  const integration = await Integrations.createIntegration({
    name: 'Messenger for Local publisher',
    kind: 'messenger',
    brandId: brand._id
  });

  await Channels.createChannel({
    name: 'Sales',
    integrationIds: [integration._id]
  }, user._id);

  for(let i=1; i<=10; i++){
      const company = await companyFactory();
      const customer = await customerFactory({companyIds: [company._id]});
      await segmentsFactory();

      const conversation = await conversationFactory({customerId: customer._id,
                                                      integrationId: integration._id});
      await conversationMessageFactory({conversationId: conversation._id});
      if( i > 7 ){
        await responseTemplateFactory({brandId: brand._id});
      }
  }
  await formFactory({ createdUserId: user._id });
  disconnect();
};


importData();
