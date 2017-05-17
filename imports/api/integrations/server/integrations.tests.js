/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';
import { Integrations } from '../integrations';
import { KIND_CHOICES } from '../constants';
import { addMessenger, editMessenger, addForm, editForm, remove } from './methods';

describe('integrations', function() {
  describe('methods', function() {
    let userId;
    let brandId;

    beforeEach(function() {
      Integrations.remove({});

      userId = Factory.create('user')._id;
      brandId = Factory.create('brand', { userId })._id;
    });

    it('add messenger messsaging', function() {
      addMessenger._execute({ userId }, { doc: { name: 'Foo', brandId } });

      const integration = Integrations.findOne({ name: 'Foo' });

      // check field values
      assert.equal(integration.kind, KIND_CHOICES.MESSENGER);
      assert.equal(integration.brandId, brandId);
    });

    it('edit messenger messsaging', function() {
      const kind = KIND_CHOICES.MESSENGER;
      const messenger = Factory.create('integration', { name: 'Old messenger', kind });
      const nameToUpdate = 'updated messenger';
      const brandToUpdate = Factory.create('brand')._id;

      editMessenger._execute(
        { userId },
        {
          _id: messenger._id,
          doc: { name: nameToUpdate, brandId: brandToUpdate },
        },
      );

      const integration = Integrations.findOne({});

      // check field values
      assert.equal(integration.name, nameToUpdate);
      assert.equal(integration.kind, kind);
      assert.equal(integration.brandId, brandToUpdate);
    });

    it('add form', function() {
      const formId = Factory.create('form')._id;

      addForm._execute(
        { userId },
        { doc: { name: 'Foo', brandId, formId, formLoadType: 'popup' } },
      );

      const integration = Integrations.findOne({ name: 'Foo' });

      // check field values
      assert.equal(integration.kind, KIND_CHOICES.FORM);
      assert.equal(integration.brandId, brandId);
      assert.equal(integration.formId, formId);
    });

    it('edit form', function() {
      const formId = Factory.create('form')._id;
      const kind = KIND_CHOICES.FORM;
      const name = 'Old form';
      const form = Factory.create('integration', { name, kind, formId });
      const nameToUpdate = 'updated form';

      editForm._execute(
        { userId },
        {
          _id: form._id,
          doc: { name: nameToUpdate, brandId, formId, formLoadType: 'popup' },
        },
      );

      const integration = Integrations.findOne({});

      // check field values
      assert.equal(integration.name, nameToUpdate);
      assert.equal(integration.kind, kind);
      assert.equal(integration.formId, formId);
    });

    describe('remove', function() {
      it('can not remove integration used in channel', function() {
        // create integration
        const integrationId = Factory.create('integration')._id;

        // create channel using integration
        Factory.create('channel', { integrationIds: [integrationId] });

        // check exception
        assert.throws(
          () => {
            remove._execute({ userId }, integrationId);
          },
          Meteor.Error,
          /integrations.remove.usedInChannel/,
        );
      });

      it('remove', function() {
        const integrationId = Factory.create('integration')._id; // create

        assert.equal(Integrations.find().count(), 1); // check created

        remove._execute({ userId }, integrationId); // try to delete

        assert.equal(Integrations.find().count(), 0); // check deleted
      });
    });
  });
});
