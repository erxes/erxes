import * as faker from 'faker';
import { connect, disconnect, graphqlRequest } from '../db/connection';
import { formFactory, userFactory } from '../db/factories';
import { Forms, Users } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

/*
 * Generate test data
 */
const args = {
  title: faker.random.word(),
  description: faker.random.word(),
};

describe('form and formField mutations', () => {
  let _user;
  let _form;
  let context;

  const commonParamDefs = `
    $title: String!
    $description: String
  `;

  const commonParams = `
    title: $title
    description: $description
  `;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({ role: 'admin' });
    _form = await formFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Forms.remove({});
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
