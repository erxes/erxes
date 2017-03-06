/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-underscore-dangle */

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { Factory } from 'meteor/dburles:factory';
import { Integrations } from '/imports/api/integrations/integrations';

import '/imports/api/users/factory';

import { Forms, Fields } from '../forms';
import {
  add, edit, remove, addField, editField,
  removeField, updateFieldsOrder,
} from '../methods';

import './publications';

describe('forms', function () {
  describe('methods', function () {
    let userId;
    let formId;

    beforeEach(function () {
      // Clear
      Forms.remove({});
      Fields.remove({});

      userId = Factory.create('user')._id;
      formId = Factory.create('form')._id;
    });

    it('add', function () {
      assert.equal(Forms.find().count(), 1);

      // method call
      add._execute({ userId }, { doc: { title: 'Test form', code: 'test-form' } });

      assert.equal(Forms.find().count(), 2);
    });

    it('edit', function () {
      edit._execute(
        { userId },
        { id: formId, doc: { title: 'Updated title', code: 'updated-code' } },
      );

      assert.equal(Forms.findOne(formId).title, 'Updated title');
    });

    describe('remove', function () {
      it('can not delete because it has some fields', function () {
        Factory.create('formField', { formId, name: 'firstName' });

        assert.throws(
          () => {
            remove._execute({ userId }, formId);
          },
          Meteor.Error,
          /forms.cannotDelete.hasFields/,
        );

        // remove fields to make form available to remove
        Fields.remove({});
      });

      it('can not delete because it used in integration', function () {
        Factory.create('integration', { formId });

        assert.throws(
          () => {
            remove._execute({ userId }, formId);
          },
          Meteor.Error,
          /forms.cannotDelete.usedInIntegration/,
        );

        // remove integration to make form available to remove
        Integrations.remove({});
      });

      it('remove successfully', function () {
        assert.equal(Forms.find().count(), 1);

        remove._execute({ userId }, formId);

        assert.equal(Forms.find().count(), 0);
      });
    });

    it('add new field', function () {
      // making sure that no previous fields
      assert.equal(Fields.find().count(), 0);

      addField._execute(
        { userId },
        { formId, doc: { type: 'input', name: 'firstName', isRequired: false } },
      );

      // checking creation
      assert.equal(Fields.find().count(), 1);

      const field = Fields.findOne();

      assert.equal(field.order, 0);
    });

    it('edit field', function () {
      const _id = Factory.create('formField', { name: 'firstName' })._id;

      editField._execute(
        { userId },
        { _id, doc: { type: 'input', name: 'updatedFirstName', isRequired: true } },
      );

      const field = Fields.findOne({ _id });

      assert.equal(field.name, 'updatedFirstName');
    });

    it('remove field', function () {
      const _id = Factory.create('formField', { name: 'firstName' })._id;

      removeField._execute({ userId }, { _id });

      assert.equal(Fields.find().count(), 0);
    });

    it('update fields order', function () {
      const _id = Factory.create('formField', { name: 'firstName' })._id;

      updateFieldsOrder._execute(
        { userId },
        { orderDics: [{ _id, order: 10 }] },
      );

      const field = Fields.findOne({ _id });

      assert.equal(field.order, 10);
    });
  });
});
