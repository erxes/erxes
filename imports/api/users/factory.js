import faker from 'faker';
import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';

Factory.define('user', Meteor.users, {
  details: {
    fullName: `${faker.name.firstName} ${faker.name.lastName}`,
    twitterUsername: faker.internet.userName,
  },
  emails: [
    {
      address: faker.internet.email,
      verified: false,
    },
  ],
});
