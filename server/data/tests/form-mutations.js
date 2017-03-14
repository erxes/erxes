/* eslint-env mocha */

import { expect } from 'chai';
import formMutations from '../form-mutations';
import { Brands, Integrations } from '../connectors';
import { brandFactory, integrationFactory } from './factories';


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

describe('Form mutations', () => {
  // remove previous datas
  afterEach((done) => {
    const p1 = Integrations.remove({});
    const p2 = Brands.remove({});

    expectPromise(done, Promise.all([p1, p2]), () => { done(); });
  });

  describe('formConnect', () => {
    const brandCode = 'code';
    const formId = 'DFDFDFD';

    beforeEach((done) => {
      // create brand
      brandFactory({ code: brandCode }).then((brand) => {
        // create integration
        integrationFactory({ brandId: brand._id, formId, kind: 'form' }).then(() => {
          done();
        });
      });
    });

    it('connect', (done) => {
      // call mutation
      expectPromise(
        done,
        formMutations.formConnect({}, { brandCode }),
        (res) => {
          // must return integrationId and newly created customerId
          expect(res.integrationId).to.not.equal(undefined);
          expect(res.formId).equal(formId);

          done();
        });
    });
  });
});
