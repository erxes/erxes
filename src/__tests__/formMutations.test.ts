import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import { formFactory, userFactory } from '../db/factories';
import { Forms, FormSubmissions, Users } from '../db/models';

import { FORM_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

/*
 * Generate test data
 */
const args = {
  title: faker.random.word(),
  description: faker.random.word(),
  type: FORM_TYPES.GROWTH_HACK,
};

describe('form and formField mutations', () => {
  let _user;
  let _form;
  let context;

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
    _user = await userFactory({});
    _form = await formFactory({});

    context = { user: _user };
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

    const form = await graphqlRequest(mutation, 'formsAdd', args, context);

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

    const form = await graphqlRequest(mutation, 'formsEdit', { _id: _form._id, ...args }, context);

    expect(form._id).toBe(_form._id);
    expect(form.title).toBe(args.title);
    expect(form.description).toBe(args.description);
  });
});
