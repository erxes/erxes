/* eslint-env mocha */

import mongoose from 'mongoose';
import { expect } from 'chai';
import { Customers, Brands, Integrations } from '../connectors';
import { createCustomer } from '../utils';
import inAppMutations from '../inapp-mutations';


// helper function that calls then and catch on given promise
const expectPromise = (done, promise, callback) => {
  // success callback
  promise.then((...params) => {
    callback(...params);

  // catch exception
  }).catch((error) => {
    done(error);
  });
};

describe('Mutations', () => {
  before(() => {
    mongoose.connect('mongodb://localhost/node-test');
  });

  describe('inAppConnect', () => {
    let integrationId;
    let customerId;

    const brandCode = 'code';
    const email = 'email@domain.com';

    // create initial values
    beforeEach((done) => {
      // create brand
      const brand = new Brands({
        code: brandCode,
        userId: 'DFDFDFDERERERE',
        createdAt: new Date(),
      });

      // create integration
      brand.save().then((brandId) => {
        const integration = new Integrations({
          brandId,
          name: 'In app messaging',
          kind: 'in_app_messaging',
        });

        integration.save().then(({ _id }) => {
          integrationId = _id;
          done();
        });
      });
    });

    // remove previous datas
    afterEach((done) => {
      const p1 = Customers.remove({});
      const p2 = Integrations.remove({});
      const p3 = Brands.remove({});

      expectPromise(done, Promise.all([p1, p2, p3]), () => { done(); });
    });

    describe('first time', () => {
      beforeEach((done) => {
        // there must be no customer
        expectPromise(done, Customers.find().count(), (count) => {
          expect(count).to.equal(0);
          done();
        });
      });

      it('first time', (done) => {
        // call mutation
        expectPromise(
          done,
          inAppMutations.inAppConnect({}, { brandCode, email }),
          (res) => {
            // must return integrationId and newly created customerId
            expect(res.integrationId).to.not.equal(undefined);
            expect(res.customerId).to.not.equal(undefined);

            // must be created 1 customer
            const p1 = Customers.find().count().then((count) => {
              expect(count).to.equal(1);
            });

            // check customer fields
            const p2 = Customers.findOne({}).then((customer) => {
              expect(customer.email).to.equal(email);
              expect(customer.inAppMessagingData.lastSeenAt).to.not.equal(undefined);
              expect(customer.inAppMessagingData.isActive).to.equal(true);
              expect(customer.inAppMessagingData.sessionCount).to.equal(1);
            });

            expectPromise(done, Promise.all([p1, p2]), () => { done(); });
          });
      });
    });

    describe('second time', () => {
      beforeEach((done) => {
        // create initial customer
        createCustomer({ integrationId, email }).then((customer) => {
          customerId = customer._id;

          done();
        });
      });

      it('second time', (done) => {
        // call mutation
        expectPromise(
          done,
          inAppMutations.inAppConnect({}, { brandCode, email }),
          (res) => {
            // must return integrationId and old customerId
            expect(res.integrationId).to.equal(integrationId);
            expect(res.customerId).to.equal(customerId);

            // must not created any customer
            const p1 = Customers.find().count().then((count) => {
              expect(count).to.equal(1);
            });

            expectPromise(done, Promise.all([p1]), () => { done(); });
          });
      });
    });
  });
});
