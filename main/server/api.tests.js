/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */

import faker from 'faker';

import { Meteor } from 'meteor/meteor';
import { DDP } from 'meteor/ddp-client';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';

import { connect, sendMessage } from './api';

describe('API', function () {
  describe('connect', function () {
    let connection;
    let code;

    before(function () {
      connection = DDP.connect(Meteor.absoluteUrl());

      const brand = Factory.create('brand');
      code = brand.code;
    });

    it('brand not found', function () {
      assert.throws(() => {
        connection.call(connect.name, {
          brand_id: Random.id(),
          email: faker.internet.email(),
        });
      }, Meteor.Error, /api.connect.brandNotFound/);
    });

    it('connect', function () {
      connection.call(connect.name, {
        brand_id: code,
        email: faker.internet.email(),
      });
    });

    it('connection required', function () {
      assert.throws(() => {
        connect._execute({}, {
          brand_id: Random.id(),
          email: faker.internet.email(),
        });
      }, Meteor.Error, /api.connect.connectionRequired/);
    });

    after(function () {
      connection.close();
    });
  });

  describe('sendMessage', function () {
    let connection;

    before(function () {
      connection = DDP.connect(Meteor.absoluteUrl());

      const brand = Factory.create('brand');
      const code = brand.code;

      connection.call(connect.name, {
        brand_id: code,
        email: faker.internet.email(),
      });
    });

    it('send message', function () {
      connection.call(sendMessage.name, { message: 'hello' });
    });

    it('connection required', function () {
      assert.throws(() => {
        sendMessage._execute({}, { message: 'hello' });
      }, Meteor.Error, /api.connection.connectionRequired/);
    });

    after(function () {
      connection.close();
    });
  });

  describe('rate limiting', function () {
    it('does not allow more than 5 operations rapidly', function () {
      const connection = DDP.connect(Meteor.absoluteUrl());

      _.times(5, () => {
        assert.throws(() => {
          connection.call(connect.name, {
            brand_id: Random.id(),
            email: faker.internet.email(),
          });
        }, Meteor.Error, /api.connect.brandNotFound/);
      });

      assert.throws(() => {
        connection.call(connect.name, {});
      }, Meteor.Error, /too-many-requests/);

      connection.disconnect();
    });
  });
});
