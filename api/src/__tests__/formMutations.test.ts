import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import { fieldFactory, formFactory, growthHackFactory } from '../db/factories';
import { Forms, FormSubmissions, Users } from '../db/models';

import { FORM_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

/*
 * Generate test data
 */
const args = {
  title: faker.random.word(),
  description: faker.random.word(),
  type: FORM_TYPES.GROWTH_HACK
};

describe('form and formField mutations', () => {
  let _form;

  const commonParamDefs = `
    $title: String!
    $type: String!
    $description: String
  `;

  const commonParams = `
    title: $title
    type: $type
    description: $description
  `;

  beforeEach(async () => {
    // Creating test data
    _form = await formFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Users.deleteMany({});
    await Forms.deleteMany({});
    await FormSubmissions.deleteMany({});
  });

  test('Add form', async () => {
    const mutation = `
      mutation formsAdd(${commonParamDefs}) {
        formsAdd(${commonParams}) {
          title
          description
        }
      }
    `;

    const form = await graphqlRequest(mutation, 'formsAdd', args);

    expect(form.title).toBe(args.title);
    expect(form.description).toBe(args.description);
  });

  test('Edit form', async () => {
    const mutation = `
      mutation formsEdit($_id: String! ${commonParamDefs}) {
        formsEdit(_id: $_id ${commonParams}) {
          _id
          title
          description
        }
      }
    `;

    const form = await graphqlRequest(mutation, 'formsEdit', {
      _id: _form._id,
      ...args
    });

    expect(form._id).toBe(_form._id);
    expect(form.title).toBe(args.title);
    expect(form.description).toBe(args.description);
  });

  test('Form submission save', async () => {
    const mutation = `
      mutation formSubmissionsSave($formId: String $contentTypeId: String $contentType: String $formSubmissions: JSON) {
        formSubmissionsSave(formId: $formId contentTypeId: $contentTypeId contentType: $contentType formSubmissions: $formSubmissions)
      }
    `;

    const growthHack = await growthHackFactory();
    const form = await formFactory();
    const formField = await fieldFactory({
      text: 'age',
      contentType: 'form',
      contentTypeId: form._id
    });

    const formSubmissionArgs: any = {
      formId: form._id,
      contentTypeId: growthHack._id,
      contentType: 'growthHack',
      formSubmissions: {
        [formField._id]: 10
      }
    };

    let response = await graphqlRequest(
      mutation,
      'formSubmissionsSave',
      formSubmissionArgs
    );

    expect(response).toBe(true);

    formSubmissionArgs.formSubmissions = null;
    response = await graphqlRequest(
      mutation,
      'formSubmissionsSave',
      formSubmissionArgs
    );

    expect(response).toBe(true);

    formSubmissionArgs.formSubmissions = {
      [formField._id]: 20
    };

    response = await graphqlRequest(
      mutation,
      'formSubmissionsSave',
      formSubmissionArgs
    );

    expect(response).toBe(true);
  });
});
