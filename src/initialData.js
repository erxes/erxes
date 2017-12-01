#!/usr/bin/env node
'use strict';

import {
  Users,
  Brands,
  Integrations,
  Channels
} from './db/models';
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

  disconnect();
};


importData();
