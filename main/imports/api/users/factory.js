import { Meteor } from 'meteor/meteor';
import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';


Factory.define('user', Meteor.users, {
  details: {
    fullName: `${faker.name.firstName} ${faker.name.lastName}`,
  },

  emails: [
    {
      address: faker.internet.email,
      verified: false,
    },
  ],
});
