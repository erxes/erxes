import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { _ } from 'meteor/underscore';

import { ErxesMixin } from '/imports/api/utils';
import { Customers } from '/imports/api/customers/customers';
import { Brands, emailConfigSchema } from './brands';

// brand add
export const add = new ValidatedMethod({
  name: 'brands.add',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, Brands.schema);
  },

  run({ doc }) {
    const id = Brands.insert(_.extend({ userId: this.userId }, doc));
    return id;
  },
});

// brand edit
export const edit = new ValidatedMethod({
  name: 'brands.edit',
  mixins: [ErxesMixin],

  validate({ id, doc }) {
    check(id, String);
    check(doc, Brands.schema);
  },

  run({ id, doc }) {
    const brand = Brands.findOne(id, { fields: { userId: 1 } });

    if (!brand) {
      throw new Meteor.Error('brands.edit.notFound', 'Brand not found');
    }

    if (this.userId !== brand.userId) {
      throw new Meteor.Error('brands.edit.accessDenied',
        'You don\'t have permission to edit this brand.');
    }

    return Brands.update(id, { $set: doc });
  },
});


// brand remove
export const remove = new ValidatedMethod({
  name: 'brands.remove',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    const brand = Brands.findOne(id, { fields: { userId: 1 } });

    if (!brand) {
      throw new Meteor.Error('brands.remove.notFound', 'Brand not found');
    }

    if (this.userId !== brand.userId) {
      throw new Meteor.Error('brands.remove.accessDenied',
        'You don\'t have permission to remove this brand.');
    }

    // can't remove a brand with customers
    const haveCustomers = Customers.findOne({
      brandId: id,
    });

    if (haveCustomers) {
      throw new Meteor.Error('brands.remove.restricted',
        'Can\'t remove a brand with customers');
    }

    return Brands.remove(id);
  },
});


// config email
export const configEmail = new ValidatedMethod({
  name: 'brands.configEmail',
  mixins: [ErxesMixin],

  validate({ id, config }) {
    check(id, String);
    check(config, emailConfigSchema);
  },

  run({ id, config }) {
    return Brands.update(id, { $set: { emailConfig: config } });
  },
});
