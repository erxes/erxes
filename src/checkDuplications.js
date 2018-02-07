#!/usr/bin/env node
'use strict';

import { Customers } from './db/models';
import { connect, disconnect } from './db/connection';

export const checkDuplications = async () => {
  connect();

  const duplications = await Customers.aggregate([
    {
      $group: {
        _id: { email: '$email' },
        uniqueIds: { $addToSet: '$email' },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  const duplicationEmails = duplications.map(d => d._id);

  console.log(duplicationEmails); // eslint-disable-line

  for (const duplication of duplicationEmails) {
    const email = duplication.email;

    if (!email) {
      continue;
    }

    const customers = await Customers.find({ email });
    const customerIds = customers.map(c => c._id);

    // first occurance
    const fo = await Customers.findOne({ email });

    await Customers.mergeCustomers(customerIds, {
      firstName: fo.firstName,
      lastName: fo.lastName,
      email: fo.email,
      phone: fo.phone,
      isUser: fo.isUser,
      createdAt: fo.createdAt,
      integrationId: fo.integrationId,
      tagIds: fo.tagIds,
      companyIds: fo.companyIds,
      customFieldsData: fo.customFieldsData,
      messengerData: fo.messengerData,
      twitterData: fo.twitterData,
      facebookData: fo.facebookData,
      location: fo.location,
    });

    console.log(email); // eslint-disable-line
  }

  disconnect();
};

checkDuplications();
