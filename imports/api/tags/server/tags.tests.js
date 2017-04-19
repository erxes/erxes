/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-underscore-dangle */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';
import { Conversations } from '/imports/api/conversations/conversations';
import { Tags } from '../tags';
import { TAG_TYPES } from '../constants';
import { add, edit, remove } from '../methods';
import { tagObject } from './api';

describe('tags', function() {
  describe('mutators', function() {
    afterEach(function() {
      Tags.remove({});
    });

    it('name and type combined must be unique', function() {
      const tag = Factory.create('tag');
      const tag2 = Factory.create('tag');
      const { name, type } = tag;

      assert.throws(
        () => {
          Tags.insert({ name, type, colorCode: '#FFF' });
        },
        Meteor.Error,
        /tags.insert.restricted/,
      );

      assert.throws(
        () => {
          Tags.update(tag2._id, { $set: { name, type } });
        },
        Meteor.Error,
        /tags.update.restricted/,
      );
    });

    it('can not remove tag with tagged object(s)', function() {
      const tag = Factory.create('tag');
      const conversationId = Factory.create('conversation', {
        tagIds: [tag._id],
      })._id;

      assert.throws(
        () => {
          Tags.remove(tag._id);
        },
        Meteor.Error,
        /tags.remove.restricted/,
      );

      Conversations.remove(conversationId);
      Tags.remove(tag._id);
    });

    it('decrease object count when removed', function() {
      const tagId = Factory.create('tag', { objectCount: 1 })._id;
      const conversationId = Factory.create('conversation', { tagIds: [tagId] })._id;

      Conversations.remove(conversationId);
      assert.equal(Tags.findOne(tagId).objectCount, 0);
    });
  });

  describe('methods', function() {
    let userId;

    beforeEach(function() {
      Tags.remove({});

      userId = Factory.create('user')._id;
    });

    describe('add', function() {
      const data = {
        name: 'foo',
        type: TAG_TYPES.CONVERSATION,
        colorCode: '#FFF',
      };

      it('only works if you are logged in', function() {
        assert.throws(
          () => {
            add._execute({}, data);
          },
          Meteor.Error,
          /loginRequired/,
        );
      });

      it('type & name combined should be unique', function() {
        const tag = Factory.create('tag');
        assert.throws(
          () => {
            add._execute({ userId }, { name: tag.name, type: tag.type, colorCode: '#FFF' });
          },
          Meteor.Error,
          /tags.insert.restricted/,
        );
      });

      it('add', function() {
        assert.equal(Tags.find().count(), 0);

        add._execute({ userId }, data);

        assert.equal(Tags.find().count(), 1);
      });
    });

    describe('edit', function() {
      const data = {
        name: 'foo',
        type: TAG_TYPES.CONVERSATION,
        colorCode: '#FFF',
      };

      it('only works if you are logged in', function() {
        assert.throws(
          () => {
            edit._execute({}, { id: Random.id(), doc: data });
          },
          Meteor.Error,
          /loginRequired/,
        );
      });

      it('tag must exist', function() {
        assert.throws(
          () => {
            edit._execute({ userId }, { id: Random.id(), doc: data });
          },
          Meteor.Error,
          /tags.edit.notFound/,
        );
      });

      it('type & name combined should be unique', function() {
        const tag = Factory.create('tag');
        const tag2 = Factory.create('tag');

        assert.throws(
          () => {
            edit._execute(
              { userId },
              {
                id: tag2._id,
                doc: { name: tag.name, type: tag.type, colorCode: '#FFF' },
              },
            );
          },
          Meteor.Error,
          /tags.update.restricted/,
        );
      });

      it('edit', function() {
        const tag = Factory.create('tag');
        assert.notEqual(tag.name, 'foo');

        edit._execute({ userId }, { id: tag._id, doc: data });

        assert.equal(Tags.findOne(tag._id).name, 'foo');
      });
    });

    describe('remove', function() {
      it('only works if you are logged in', function() {
        assert.throws(
          () => {
            remove._execute({}, [Random.id()]);
          },
          Meteor.Error,
          /loginRequired/,
        );
      });

      it('tag must exist', function() {
        assert.throws(
          () => {
            remove._execute({ userId }, [Random.id()]);
          },
          Meteor.Error,
          /tags.remove.notFound/,
        );
      });

      it('can not remove tag with tagged object(s)', function() {
        const tag = Factory.create('tag');
        const tickedId = Factory.create('conversation', { tagIds: [tag._id] })._id;

        assert.throws(
          () => {
            remove._execute({ userId }, [tag._id]);
          },
          Meteor.Error,
          /tags.remove.restricted/,
        );

        Conversations.remove(tickedId);
      });

      it('remove', function() {
        const tag = Factory.create('tag');
        assert.equal(Tags.find().count(), 1);

        remove._execute({ userId }, [tag._id]);

        assert.equal(Tags.find().count(), 0);
      });
    });
  });

  describe('api', function() {
    beforeEach(function() {
      Tags.remove({});
    });

    describe('tagObject', function() {
      it('verify tags', function() {
        assert.throws(
          () => {
            tagObject({
              tagIds: [Random.id()],
              objectIds: [Random.id()],
              collection: Conversations,
            });
          },
          Meteor.Error,
          /tags.tagObject.notFound/,
        );
      });

      it('tag object', function() {
        const tagId = Factory.create('tag')._id;
        const conversationId = Factory.create('conversation')._id;

        tagObject({
          tagIds: [tagId],
          objectIds: [conversationId],
          collection: Conversations,
        });

        assert.equal(Tags.findOne(tagId).objectCount, 1);
        assert.equal(Conversations.findOne(conversationId).tagIds[0], tagId);

        tagObject({
          tagIds: [],
          objectIds: [conversationId],
          collection: Conversations,
        });
        assert.equal(Tags.findOne(tagId).objectCount, 0);
      });
    });
  });
});
