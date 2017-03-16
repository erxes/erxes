/* eslint-env mocha */

import { expect } from 'chai';
import formMutations, { validate, saveValues } from '../form-mutations';
import {
  Brands,
  Integrations,
  Forms,
  FormFields,
  Conversations,
  Messages,
  Customers,
} from '../connectors';
import {
  brandFactory,
  integrationFactory,
  formFieldFactory,
  formFactory,
} from './factories';


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
    const p3 = FormFields.remove({});
    const p4 = Conversations.remove({});
    const p5 = Messages.remove({});
    const p6 = Forms.remove({});
    const p7 = Customers.remove({});

    expectPromise(done, Promise.all([p1, p2, p3, p4, p5, p6, p7]), () => { done(); });
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

  describe('validate', () => {
    const formId = 'DFDFDAFD';
    let fieldId;

    beforeEach((done) => {
      // create required form field
      formFieldFactory({ formId, isRequired: true }).then((field) => {
        fieldId = field._id;

        done();
      });
    });

    it('validate', (done) => {
      // call function
      expectPromise(
        done,
        validate(formId, [{ _id: fieldId, value: null }]),
        (errors) => {
          // must be 1 error
          expect(errors.length).equal(1);

          const error = errors[0];

          // check error attributes
          expect(error.fieldId).equal(fieldId);
          expect(error.code).equal('required');

          done();
        });
    });
  });

  describe('saveValues', () => {
    const integrationId = 'DFDFDAFD';
    const formTitle = 'Form';

    let formId;
    let emailFieldId;
    let firstNameFieldId;
    let lastNameFieldId;
    let arbitraryFieldId;

    beforeEach((done) => {
      // create form
      formFactory({ title: formTitle }).then((form) => {
        formId = form._id;
      })

      // create fields
      .then(() =>
        formFieldFactory({ formId, type: 'emailFieldId' }).then((field) => {
          emailFieldId = field._id;
        }),
      )
      .then(() =>
        formFieldFactory({ formId, type: 'firstNameFieldId' }).then((field) => {
          firstNameFieldId = field._id;
        }),
      )
      .then(() =>
        formFieldFactory({ formId, type: 'lastNameFieldId' }).then((field) => {
          lastNameFieldId = field._id;
        }),
      )
      .then(() =>
        formFieldFactory({ formId, type: 'input' }).then((field) => {
          arbitraryFieldId = field._id;

          done();
        }),
      );
    });

    it('saveValues', (done) => {
      const submissions = [
        { _id: arbitraryFieldId, value: 'Value', type: 'input' },
        { _id: emailFieldId, value: 'email@gmail.com', type: 'email' },
        { _id: firstNameFieldId, value: 'first name', type: 'firstName' },
        { _id: lastNameFieldId, value: 'last name', type: 'lastName' },
      ];

      // call function
      expectPromise(
        done,
        saveValues({ integrationId, formId, submissions }),
        () => {
          // must create 1 conversation
          const p1 = Conversations.find().count().then((count) => {
            expect(count).to.equal(1);
          });

          // must create 1 message
          const p2 = Messages.find().count().then((count) => {
            expect(count).to.equal(1);
          });

          // check conversation fields
          const p3 = Conversations.findOne({}).then((conversation) => {
            expect(conversation.content).to.equal(formTitle);
            expect(conversation.integrationId).to.equal(integrationId);
          });

          // check message fields
          const p4 = Messages.findOne({}).then((message) => {
            expect(message.content).to.equal(formTitle);
            expect(message.formWidgetData).to.deep.equal(submissions);
          });

          // must create 1 customer
          const p5 = Customers.find().count().then((count) => {
            expect(count).to.equal(1);
          });

          // check customer fields
          const p6 = Customers.findOne({}).then((customer) => {
            expect(customer.email).to.equal('email@gmail.com');
            expect(customer.name).to.equal('last name first name');
          });

          expectPromise(done, Promise.all([p1, p2, p3, p4, p5, p6]), () => { done(); });
        });
    });
  });
});
